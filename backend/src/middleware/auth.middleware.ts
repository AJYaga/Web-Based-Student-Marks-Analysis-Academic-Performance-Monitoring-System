import type { NextFunction, Request, Response } from "express"

import { verifyToken } from "../utils/jwt.js"

export type AuthenticatedRequest = Request & {
  teacher?: {
    teacherId: string
    email: string
  }
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token =
      req.cookies?.eduinsight_token ||
      req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const payload = verifyToken(token)

    req.teacher = {
      teacherId: payload.teacherId,
      email: payload.email,
    }

    next()
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    })
  }
}