import { Router } from "express"

import {
  getStudentReport,
} from "../controllers/report.controller.js"

import {
  requireAuth,
} from "../middleware/auth.middleware.js"

const router = Router()

router.use(requireAuth)

router.get(
  "/student",
  getStudentReport
)

export default router