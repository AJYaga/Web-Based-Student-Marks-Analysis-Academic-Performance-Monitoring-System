import { Router } from "express"

import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
} from "../controllers/student.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js"

const router = Router()

router.use(requireAuth)

router.get("/", getStudents)
router.post("/", createStudent)
router.put("/:id", updateStudent)
router.delete("/:id", deleteStudent)

export default router