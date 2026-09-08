import { Router } from "express"

import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
} from "../controllers/subject.controller.js"

import { requireAuth } from "../middleware/auth.middleware.js"

const router = Router()

router.use(requireAuth)

router.get("/", getSubjects)
router.post("/", createSubject)
router.put("/:id", updateSubject)
router.delete("/:id", deleteSubject)

export default router