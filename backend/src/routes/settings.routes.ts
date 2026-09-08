import { Router } from "express"

import {
  changePassword,
  getProfile,
  updateProfile,
} from "../controllers/settings.controller.js"

import {
  requireAuth,
} from "../middleware/auth.middleware.js"

const router = Router()

router.use(requireAuth)

router.get("/profile", getProfile)
router.put("/profile", updateProfile)

router.put(
  "/password",
  changePassword
)

export default router