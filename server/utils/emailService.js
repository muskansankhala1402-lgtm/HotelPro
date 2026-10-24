const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // If credentials are dummy/development, log nicely to console
    console.log(`\n========================================`);
    console.log(`[EMAIL DISPATCH] To: ${to}`);
    console.log(`[EMAIL DISPATCH] Subject: ${subject}`);
    console.log(`[EMAIL DISPATCH] Message: ${text || subject}`);
    console.log(`========================================\n`);

    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'demo_hotelpro_user') {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
        port: process.env.EMAIL_PORT || 2525,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM || 'HotelPro Hospitality'}" <${process.env.EMAIL_FROM || 'no-reply@hotelpro.com'}>`,
        to,
        subject,
        text,
        html,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[Email Service Error]:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
