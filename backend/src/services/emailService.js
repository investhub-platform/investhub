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

export const buildTemplate = ({ title, message, actionUrl }) => {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;margin:40px 0;border-radius:8px;overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#0d6efd;padding:20px;text-align:center;color:#ffffff;">
                <h2 style="margin:0;">InvestHub</h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:30px;">
                <h3 style="margin-top:0;color:#333;">${title}</h3>
                <p style="color:#555;font-size:15px;line-height:1.6;">
                  ${message}
                </p>

                ${
                  actionUrl
                    ? `
                    <div style="text-align:center;margin-top:30px;">
                      <a href="${process.env.FRONTEND_URL}${actionUrl}" 
                         style="background:#0d6efd;color:#ffffff;padding:12px 25px;
                                text-decoration:none;border-radius:5px;font-weight:bold;">
                        View Details
                      </a>
                    </div>
                  `
                    : ""
                }
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f1f1f1;padding:15px;text-align:center;font-size:12px;color:#888;">
                © ${new Date().getFullYear()} InvestHub. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};