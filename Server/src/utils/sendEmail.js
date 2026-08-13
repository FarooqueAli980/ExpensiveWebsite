import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailAppPass = process.env.EMAIL_APP_PASSWORD; // App Password from Google
  const emailPass = process.env.EMAIL_PASS; // legacy password (not recommended)
  const emailFrom = process.env.EMAIL_FROM || emailUser;

  const effectivePass = emailAppPass || emailPass;
  if (!emailUser || !effectivePass) {
    console.warn('Email credentials not configured or App Password missing. Skipping email send.');
    console.log({ to, subject, text, html });
    return null;
  }

  // Remove whitespace that may be present if user pasted grouped App Password
  const sanitizedPass = effectivePass.replace(/\s+/g, '');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: sanitizedPass,
    },
  });

  const message = {
    from: emailFrom,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Email send failed:', err && err.message ? err.message : err);
    throw err;
  }
};

export default sendEmail;
