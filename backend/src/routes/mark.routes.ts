import { Router } from "express"

import {
  getMarksEntry,
  saveMarks,
} from "../controllers/mark.controller.js"

import { requireAuth } from "../middleware/auth.middleware.js"

const router = Router()

router.use(requireAuth)

router.get("/", getMarksEntry)
router.post("/", saveMarks)

export default router