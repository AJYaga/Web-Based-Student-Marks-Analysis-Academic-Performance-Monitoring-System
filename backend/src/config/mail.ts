import nodemailer from "nodemailer"

const host = process.env.SMTP_HOST
const port = Number(process.env.SMTP_PORT || 465)
const secure =
  process.env.SMTP_SECURE === "true"

const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS

if (!host || !user || !pass) {
  throw new Error(
    "SMTP configuration is incomplete"
  )
}

export const mailTransporter =
  nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })