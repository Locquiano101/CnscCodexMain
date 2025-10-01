import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

// Set __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Fix: Add tls.rejectUnauthorized = false for development with self-signed certs
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // <-- bypass cert check for dev
  },
});

export const NodeEmail = async (emailAddress, emailSubject, emailMessage) => {
  if (!emailAddress) {
    console.error("NodeEmail: No recipient email address provided.");
    return { success: false, error: "Missing recipient" };
  }
  console.error(emailAddress);

  console.log("Sending Email...");
  try {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif;  padding: 24px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          
          <!-- Header with image + subject -->
          <div style="background-color: #500000; color: #ffffff; padding: 15px 20px; font-size: 20px; font-weight: bold; display: flex; align-items: center; justify-content: center;">
            <img src="cid:logo@unique"  style="width: 40px; height: 40px; margin-right: 10px; border-radius: 4px;" />
            <span style="font-family: Arial, sans-serif;">${emailSubject}</span>
          </div>
          
          <!-- Body -->
          <div style="padding: 20px; color: #333333; line-height: 1.6;">
            ${emailMessage.replace(/\n/g, "<br/>")}
          </div>
          
          <!-- Footer -->
          <div style="padding: 15px 20px; font-size: 12px; color: #888888; background-color: #f0f0f0; text-align: center;">
            This is an auto-generated email. DO NOT REPLY.
          </div>
        </div>
      </div>
    `;

    console.log(path.join(__dirname, "cnsc-codex.png "));

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emailAddress,
      subject: emailSubject,
      text: emailMessage,
      html: htmlTemplate,
      attachments: [
        {
          filename: "cnsc-codex.png",
          path: path.join(__dirname, "cnsc-codex.png"), // absolute path
          cid: "logo@unique",
        },
      ],
    });

    console.log("Email Sent! ", emailMessage);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
};
