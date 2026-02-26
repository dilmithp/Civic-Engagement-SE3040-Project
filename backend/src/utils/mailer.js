import nodemailer from 'nodemailer';
import {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  MAIL_FROM
} from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: false,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS
  }
});

export const sendNewSurveyNotification = async (toEmail, surveyTitle, surveyId) => {
  const mailOptions = {
    from: MAIL_FROM,
    to: toEmail,
    subject: `📢 New Important Survey: ${surveyTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2e7d32;">New Survey Available</h2>
        <p>A new important survey has been published in your area:</p>
        <h3>${surveyTitle}</h3>
        <p>Your opinion matters! Please log in to participate.</p>
        <a href="${process.env.FRONTEND_URL}/surveys/${surveyId}"
           style="background-color:#2e7d32; color:white; padding:10px 20px;
                  text-decoration:none; border-radius:5px; display:inline-block;">
          Vote Now
        </a>
        <p style="margin-top: 20px; color: #888; font-size: 12px;">
          Civic Engagement & Sustainability Platform
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendSurveyClosingReminder = async (toEmail, surveyTitle, deadline) => {
  const mailOptions = {
    from: MAIL_FROM,
    to: toEmail,
    subject: `⏰ Survey Closing Soon: ${surveyTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #e65100;">Survey Closing Soon</h2>
        <p>The following survey will close on <strong>${new Date(deadline).toLocaleDateString()}</strong>:</p>
        <h3>${surveyTitle}</h3>
        <p>Don't miss your chance to vote!</p>
        <p style="margin-top: 20px; color: #888; font-size: 12px;">
          Civic Engagement & Sustainability Platform
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
