import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT == 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendOtpEmail(toEmail, otp) {
  const html = `
    <h2>Password Reset OTP</h2>
    <p>Your OTP is: <b>${otp}</b></p>
    <p>This OTP is valid for 10 minutes.</p>
  `;

  return transporter.sendMail({
    from: SMTP_USER,
    to: toEmail,
    subject: "Your Password Reset OTP",
    html,
  });
}
