import { Router } from "express"

import {
  createExamination,
  deleteExamination,
  getExaminations,
  updateExamination,
} from "../controllers/examination.controller.js"

import { requireAuth } from "../middleware/auth.middleware.js"

const router = Router()

router.use(requireAuth)

router.get("/", getExaminations)
router.post("/", createExamination)
router.put("/:id", updateExamination)
router.delete("/:id", deleteExamination)

export default router