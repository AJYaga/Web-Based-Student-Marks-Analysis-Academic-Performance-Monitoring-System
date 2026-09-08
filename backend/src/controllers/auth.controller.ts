import type { Request, Response } from "express"
import bcrypt from "bcrypt"

import { prisma } from "../config/prisma.js"
import { generateToken } from "../utils/jwt.js"
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js"

import crypto from "crypto"

import {
  sendPasswordResetEmail,
} from "../services/password-reset-mail.service.js"

const COOKIE_NAME = "eduinsight_token"

function setAuthCookie(
  res: Response,
  token: string,
  rememberMe: boolean
) {
  const options = {
    httpOnly: true,
    secure:
      process.env.NODE_ENV ===
      "production",
    sameSite:
      "lax" as const,
    path: "/",
  }

  if (rememberMe) {
    res.cookie(
      COOKIE_NAME,
      token,
      {
        ...options,
        maxAge:
          30 *
          24 *
          60 *
          60 *
          1000,
      }
    )

    return
  }

  // Session cookie:
  // deliberately no maxAge/expires
  res.cookie(
    COOKIE_NAME,
    token,
    options
  )
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      })
    }

    const existingTeacher = await prisma.teacher.findUnique({
      where: {
        email: normalizedEmail,
      },
    })

    if (existingTeacher) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const teacher = await prisma.teacher.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    const token = generateToken({
      teacherId: teacher.id,
      email: teacher.email,
      rememberMe: false,
    })

    setAuthCookie(
      res,
      token,
      false
    )

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      teacher,
    })
  } catch (error) {
    console.error("Register error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const {
      email,
      password,
      rememberMe = false,
    } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const teacher = await prisma.teacher.findUnique({
      where: {
        email: normalizedEmail,
      },
    })

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    const passwordMatches = await bcrypt.compare(
      password,
      teacher.passwordHash
    )

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    const shouldRemember =
      rememberMe === true

    const token = generateToken({
      teacherId: teacher.id,
      email: teacher.email,
      rememberMe:
        shouldRemember,
    })

    setAuthCookie(
      res,
      token,
      shouldRemember
    )

    return res.json({
      success: true,
      message:
        "Login successful",

      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
      },

      rememberMe:
        shouldRemember,
    })
  } catch (error) {
    console.error("Login error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    })
  }
}

export async function getCurrentTeacher(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const teacher = await prisma.teacher.findUnique({
      where: {
        id: teacherId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher account not found",
      })
    }

    return res.json({
      success: true,
      teacher,
    })
  } catch (error) {
    console.error("Get teacher error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve teacher profile",
    })
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })

  return res.json({
    success: true,
    message: "Logged out successfully",
  })
}

export async function forgotPassword(
  req: Request,
  res: Response
) {
  try {
    const { email } = req.body

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is required",
      })
    }

    const normalizedEmail =
      email.trim().toLowerCase()

    const genericMessage =
      "If an account exists for this email, a password reset link has been sent."

    const teacher =
      await prisma.teacher.findUnique({
        where: {
          email: normalizedEmail,
        },
      })

    if (!teacher) {
      return res.json({
        success: true,
        message: genericMessage,
      })
    }

    // Invalidate previous unused reset tokens
    await prisma.passwordResetToken.deleteMany({
      where: {
        teacherId: teacher.id,
        usedAt: null,
      },
    })

    const rawToken =
      crypto.randomBytes(32).toString("hex")

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex")

    const expiresAt =
      new Date(
        Date.now() +
          30 * 60 * 1000
      )

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        expiresAt,
        teacherId: teacher.id,
      },
    })

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:3000"

    const resetUrl =
      `${frontendUrl}/reset-password?token=${encodeURIComponent(
        rawToken
      )}`

    try {
      await sendPasswordResetEmail({
        email: teacher.email,
        teacherName: teacher.name,
        resetUrl,
      })
    } catch (mailError) {
      console.error(
        "Password reset email error:",
        mailError
      )

      return res.status(500).json({
        success: false,
        message:
          "Unable to send the password reset email. Please try again later.",
      })
    }

    return res.json({
      success: true,
      message: genericMessage,
    })
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Unable to process password reset request",
    })
  }
}

export async function validateResetToken(
  req: Request,
  res: Response
) {
  try {
    const token =
      typeof req.query.token === "string"
        ? req.query.token
        : ""

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset token is required",
      })
    }

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          tokenHash,
        },
      })

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt <
        new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This password reset link is invalid or has expired.",
      })
    }

    return res.json({
      success: true,
      message:
        "Password reset link is valid",
    })
  } catch (error) {
    console.error(
      "Validate reset token error:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Unable to validate password reset link",
    })
  }
}

export async function resetPassword(
  req: Request,
  res: Response
) {
  try {
    const {
      token,
      password,
    } = req.body

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Reset token and new password are required",
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters",
      })
    }

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")

    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          tokenHash,
        },
      })

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt <
        new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This password reset link is invalid or has expired.",
      })
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      )

    await prisma.$transaction(
      async (transaction) => {
        await transaction.teacher.update({
          where: {
            id: resetToken.teacherId,
          },

          data: {
            passwordHash,
          },
        })

        await transaction.passwordResetToken.update({
          where: {
            id: resetToken.id,
          },

          data: {
            usedAt: new Date(),
          },
        })

        await transaction.passwordResetToken.deleteMany({
          where: {
            teacherId:
              resetToken.teacherId,

            NOT: {
              id: resetToken.id,
            },
          },
        })
      }
    )

    return res.json({
      success: true,
      message:
        "Password reset successfully",
    })
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset password",
    })
  }
}