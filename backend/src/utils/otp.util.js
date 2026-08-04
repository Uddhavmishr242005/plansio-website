/* OTP Utility - SMS via Twilio or console fallback */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPSMS = async (phone, otp) => {
  if (process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_sid') {
    const twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await twilio.messages.create({
      body: `Your PLANSIO OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
      from: process.env.TWILIO_PHONE,
      to:   '+91' + phone.replace(/^\+91/, '')
    });
    return { sent: true, method: 'sms' };
  }
  // Fallback - log to console in dev
  console.log(`\n📱 OTP for ${phone}: ${otp}\n`);
  return { sent: true, method: 'console' };
};

const sendOTPEmail = async (email, otp) => {
  if (process.env.SMTP_HOST) {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({
      from:    `PLANSIO <${process.env.SMTP_USER}>`,
      to:      email,
      subject: 'Your PLANSIO Login OTP',
      html:    `<div style="font-family:sans-serif;max-width:400px;margin:auto;padding:2rem;border:1px solid #e0e0e0;border-radius:12px">
                  <h2 style="color:#1a5c2a">🌿 PLANSIO</h2>
                  <p>Your login OTP is:</p>
                  <div style="font-size:2.5rem;font-weight:900;letter-spacing:8px;color:#1a5c2a;padding:1rem;background:#e8f5ec;border-radius:8px;text-align:center">${otp}</div>
                  <p style="color:#666;font-size:.85rem;margin-top:1rem">Valid for 10 minutes. Do not share this OTP with anyone.</p>
                  <hr/><p style="color:#aaa;font-size:.75rem">J.K. Enterprises | Plansio.Jk@gmail.com</p>
                </div>`
    });
    return { sent: true, method: 'email' };
  }
  console.log(`\n📧 OTP for ${email}: ${otp}\n`);
  return { sent: true, method: 'console' };
};

module.exports = { generateOTP, sendOTPSMS, sendOTPEmail };
