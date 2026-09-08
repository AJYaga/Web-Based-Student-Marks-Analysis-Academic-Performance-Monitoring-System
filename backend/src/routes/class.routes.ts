import { Router } from "express"

import {
  createClass,
  deleteClass,
  getClasses,
  updateClass,
} from "../controllers/class.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js"

const router = Router()

router.use(requireAuth)

router.get("/", getClasses)
router.post("/", createClass)
router.put("/:id", updateClass)
router.delete("/:id", deleteClass)

export default router