import {
  mailTransporter,
} from "../config/mail.js"

type SendResetEmailInput = {
  email: string
  teacherName: string
  resetUrl: string
}

export async function sendPasswordResetEmail({
  email,
  teacherName,
  resetUrl,
}: SendResetEmailInput) {
  const from =
    process.env.MAIL_FROM ||
    process.env.SMTP_USER

  await mailTransporter.sendMail({
    from,
    to: email,

    subject:
      "Reset your EduInsight password",

    text: `
Hello ${teacherName},

We received a request to reset the password for your EduInsight account.

Reset your password using the link below:

${resetUrl}

This link will expire in 30 minutes and can only be used once.

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

Regards,
EduInsight
Academic Performance Monitoring System
    `.trim(),

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">
          Reset your EduInsight password
        </h2>

        <p>Hello ${teacherName},</p>

        <p>
          We received a request to reset the password for your EduInsight account.
        </p>

        <p style="margin: 24px 0;">
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              background: #2563eb;
              color: white;
              text-decoration: none;
              padding: 12px 18px;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link will expire in <strong>30 minutes</strong> and can only be used once.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore this email.
          Your password will remain unchanged.
        </p>

        <hr style="margin: 28px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <p style="font-size: 13px; color: #6b7280;">
          EduInsight<br />
          Academic Performance Monitoring System
        </p>
      </div>
    `,
  })
}