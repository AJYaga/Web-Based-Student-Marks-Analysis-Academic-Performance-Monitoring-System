import type { Request, Response } from "express"
import bcrypt from "bcrypt"

import { prisma } from "../config/prisma.js"
import { generateToken } from "../utils/jwt.js"
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js"

const COOKIE_NAME = "eduinsight_token"

function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
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
    })

    setAuthCookie(res, token)

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
    const { email, password } = req.body

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

    const token = generateToken({
      teacherId: teacher.id,
      email: teacher.email,
    })

    setAuthCookie(res, token)

    return res.json({
      success: true,
      message: "Login successful",
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
      },
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