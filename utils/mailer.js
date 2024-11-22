const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
});

// Function to send email
const sendMail = (to, subject, text) => {
    const htmlContent = `
    <h1>Email Verification</h1>
    <p>Please click the button below to verify your email:</p>
    <a href="${text}" style="padding: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>If the button doesn't work, copy and paste the link below into your browser:</p>
    <p>${text}</p>
  `;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: htmlContent
    };

    return transporter.sendMail(mailOptions);
};

const passwordReset = (to, subject, text) => {
    const htmlContent = `
    <h1>Password Reset</h1>
    <p>Please click the button below to reset your password:</p>
    <a href="${text}" style="padding: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset your password</a>
    <p>If the button doesn't work, copy and paste the link below into your browser:</p>
    <p>${text}</p>
  `;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: htmlContent
    };

    return transporter.sendMail(mailOptions);
};

const sendResult = async (to, subject, text) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };
  
    await transporter.sendMail(mailOptions);
  };

module.exports = {sendMail,passwordReset,sendResult};