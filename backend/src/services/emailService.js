import nodemailer from "nodemailer";
import AppError from "../utils/AppError.js";

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);

  if (!host || !port) {
    throw new Error("SMTP configuration missing");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();

    console.log("Connecting to SMTP:", process.env.SMTP_HOST, process.env.SMTP_PORT);

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email error:", err.message);
    throw new AppError(`Email send failed: ${err.message}`, 500);
  }
};
