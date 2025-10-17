// testEmail.js
import sendEmail from "./utils/sendEmail.js";

(async () => {
  try {
    await sendEmail(
      "recipient@example.com",
      "Test Email",
      "<h1>Hello from Resend!</h1><p>This is a test email.</p>"
    );
    console.log("Test email sent successfully!");
  } catch (error) {
    console.error("Error sending test email:", error.message);
  }
})();
