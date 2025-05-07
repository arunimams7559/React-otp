const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables from .env

module.exports = async (email, otp) => {
  if (!email || !otp) {
    throw new Error("Email and OTP are required.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL, // Use environment variable for email
      pass: process.env.EMAIL_PASSWORD, // Use environment variable for app password
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates if needed
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Verification Code",
    text: `Your verification code is: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; font-size: 16px;">
        <p>Your verification code is: <b>${otp}</b></p>
        <p>If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};