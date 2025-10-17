// sendEmail.js
import { Resend } from "resend";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Make sure API key exists
if (!process.env.RESEND_API_KEY) {
  throw new Error("❌ Missing RESEND_API_KEY in environment variables");
}

if (!process.env.EMAIL_FROM) {
  throw new Error("❌ Missing EMAIL_FROM in environment variables");
}

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend
 * @param {string} to - recipient email address
 * @param {string} subject - email subject
 * @param {string} html - HTML content of the email
 */
const sendEmail = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent successfully:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Email could not be sent. Try again later.");
  }
};

export default sendEmail;