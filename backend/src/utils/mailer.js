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
  secure: MAIL_PORT === 465,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS
  }
});

export const sendNewSurveyNotification = async (emailsArray, surveyTitle, surveyId, isImportant = false) => {
  const subject = isImportant
    ? `📢 Important Survey: ${surveyTitle}`
    : `📋 New Survey Available: ${surveyTitle}`;

  const recipients = Array.isArray(emailsArray) ? emailsArray : [emailsArray];
  const mailOptions = {
    from: MAIL_FROM,
    to: MAIL_USER,
    bcc: recipients.join(','),
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2e7d32;">${isImportant ? 'Important Survey' : 'New Survey'} Available</h2>
        <p>A new survey has been published${isImportant ? ' — your participation is especially encouraged' : ''}:</p>
        <h3>${surveyTitle}</h3>
        <p>Your opinion matters! Please log in to participate.</p>
        <a href="${process.env.FRONTEND_URL}/surveys/${surveyId}"
           style="background-color:#2e7d32; color:white; padding:10px 20px;
                  text-decoration:none; border-radius:5px; display:inline-block;">
          Vote Now
        </a>
        <p style="margin-top: 20px; color: #888; font-size: 12px;">
          Civic Engagement &amp; Sustainability Platform
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendSurveyClosingReminder = async (emailsArray, surveyTitle, deadline) => {
  const recipients = Array.isArray(emailsArray) ? emailsArray : [emailsArray];
  const mailOptions = {
    from: MAIL_FROM,
    to: MAIL_USER,
    bcc: recipients.join(','),
    subject: `⏰ Survey Closing Soon: ${surveyTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #e65100;">Survey Closing Soon</h2>
        <p>The following survey will close on <strong>${new Date(deadline).toLocaleDateString()}</strong>:</p>
        <h3>${surveyTitle}</h3>
        <p>Don't miss your chance to vote!</p>
        <p style="margin-top: 20px; color: #888; font-size: 12px;">
          Civic Engagement &amp; Sustainability Platform
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
