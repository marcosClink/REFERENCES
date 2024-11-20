// emailSender.js
const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = function sendEmail(to, subject, text, htmlContent) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,   // Use environment variables for security
            pass: process.env.EMAIL_PASS    // Use environment variables for security
        }
    });

    const mailOptions = {
        from: `"MARCOS PINTO " <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text,
        html: htmlContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error occurred:', error);
        }
        console.log('Message sent:', info.messageId);
    });
}
