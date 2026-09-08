import jwt from "jsonwebtoken"

export type AuthTokenPayload = {
  teacherId: string
  email: string
  rememberMe: boolean
}

export function generateToken(
  payload: AuthTokenPayload
) {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not defined"
    )
  }

  return jwt.sign(
    payload,
    secret,
    {
      expiresIn:
        payload.rememberMe
          ? "30d"
          : "1d",
    }
  )
}

export function verifyToken(
  token: string
) {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not defined"
    )
  }

  return jwt.verify(
    token,
    secret
  ) as AuthTokenPayload
}