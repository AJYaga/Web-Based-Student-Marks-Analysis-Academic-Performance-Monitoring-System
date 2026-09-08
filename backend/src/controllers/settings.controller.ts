import type { Response } from "express"
import bcrypt from "bcrypt"

import { prisma } from "../config/prisma.js"
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js"

import {
  generateToken,
} from "../utils/jwt.js"

const COOKIE_NAME =
  "eduinsight_token"

function setSessionCookie(
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

  res.cookie(
    COOKIE_NAME,
    token,
    options
  )
}

export function getSessionPreference(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.teacher) {
    return res.status(401).json({
      success: false,
      message:
        "Authentication required",
    })
  }

  return res.json({
    success: true,
    rememberMe:
      req.teacher.rememberMe,
  })
}

export async function updateSessionPreference(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacher =
      req.teacher

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      })
    }

    const {
      rememberMe,
    } = req.body

    if (
      typeof rememberMe !==
      "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Remember me preference must be true or false",
      })
    }

    const account =
      await prisma.teacher.findUnique({
        where: {
          id: teacher.teacherId,
        },

        select: {
          id: true,
          email: true,
        },
      })

    if (!account) {
      return res.status(404).json({
        success: false,
        message:
          "Teacher not found",
      })
    }

    const token =
      generateToken({
        teacherId:
          account.id,

        email:
          account.email,

        rememberMe,
      })

    setSessionCookie(
      res,
      token,
      rememberMe
    )

    return res.json({
      success: true,
      message:
        rememberMe
          ? "This device will now keep you signed in."
          : "Remember me has been disabled for this device.",
      rememberMe,
    })
  } catch (error) {
    console.error(
      "Update session preference error:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Unable to update login preference",
    })
  }
}

export async function getProfile(
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
        message: "Teacher not found",
      })
    }

    return res.json({
      success: true,
      teacher,
    })
  } catch (error) {
    console.error("Get profile error:", error)

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile",
    })
  }
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId = req.teacher?.teacherId

    const { name, email } = req.body

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      })
    }

    const normalizedEmail =
      email.trim().toLowerCase()

    const duplicate =
      await prisma.teacher.findFirst({
        where: {
          email: normalizedEmail,
          NOT: {
            id: teacherId,
          },
        },
      })

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "Another account already uses this email address",
      })
    }

    const teacher =
      await prisma.teacher.update({
        where: {
          id: teacherId,
        },

        data: {
          name: name.trim(),
          email: normalizedEmail,
        },

        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      })

    return res.json({
      success: true,
      message:
        "Profile updated successfully",
      teacher,
    })
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Unable to update profile",
    })
  }
}

export async function changePassword(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const teacherId =
      req.teacher?.teacherId

    const {
      currentPassword,
      newPassword,
    } = req.body

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least 8 characters",
      })
    }

    if (
      currentPassword ===
      newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from the current password",
      })
    }

    const teacher =
      await prisma.teacher.findUnique({
        where: {
          id: teacherId,
        },
      })

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      })
    }

    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        teacher.passwordHash
      )

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect",
      })
    }

    const passwordHash =
      await bcrypt.hash(
        newPassword,
        12
      )

    await prisma.teacher.update({
      where: {
        id: teacherId,
      },

      data: {
        passwordHash,
      },
    })

    return res.json({
      success: true,
      message:
        "Password changed successfully",
    })
  } catch (error) {
    console.error(
      "Change password error:",
      error
    )

    return res.status(500).json({
      success: false,
      message:
        "Unable to change password",
    })
  }
}