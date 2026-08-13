import dotenv from 'dotenv';
dotenv.config();
import sendEmail from './src/utils/sendEmail.js';

const run = async () => {
  try {
    console.log('Using EMAIL_USER:', process.env.EMAIL_USER);
    const res = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: 'Test email from Expense Tracker',
      text: 'This is a test email to verify SMTP configuration.',
    });
    console.log('send result:', res);
  } catch (err) {
    console.error('Test send failed:', err && err.message ? err.message : err);
  }
};

run();
