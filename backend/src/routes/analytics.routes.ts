import { Router } from "express"

import {
  getAnalytics,
} from "../controllers/analytics.controller.js"

import {
  requireAuth,
} from "../middleware/auth.middleware.js"

const router = Router()

router.use(requireAuth)

router.get("/", getAnalytics)

export default router