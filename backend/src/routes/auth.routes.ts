import { Router } from "express"

import {
  forgotPassword,
  getCurrentTeacher,
  login,
  logout,
  register,
  resetPassword,
  validateResetToken,
} from "../controllers/auth.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)

router.get("/me", requireAuth, getCurrentTeacher)

router.post(
  "/forgot-password",
  forgotPassword
)

router.get(
  "/reset-password/validate",
  validateResetToken
)

router.post(
  "/reset-password",
  resetPassword
)

export default router