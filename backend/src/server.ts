import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"

import authRoutes from "./routes/auth.routes.js"
import classRoutes from "./routes/class.routes.js"
import studentRoutes from "./routes/student.routes.js"
import subjectRoutes from "./routes/subject.routes.js"
import examinationRoutes from "./routes/examination.routes.js"
import markRoutes from "./routes/mark.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"
import analyticsRoutes from "./routes/analytics.routes.js"
import reportRoutes from "./routes/report.routes.js"
import settingsRoutes from "./routes/settings.routes.js"

dotenv.config()

const app = express()

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "EduInsight backend is running",
  })
})

app.use("/api/auth", authRoutes)
app.use("/api/classes", classRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/subjects", subjectRoutes)
app.use("/api/examinations", examinationRoutes)
app.use("/api/marks", markRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/settings", settingsRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`EduInsight backend running on http://localhost:${PORT}`)
})