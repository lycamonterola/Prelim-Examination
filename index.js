const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const nodemailer = require('nodemailer');

const GMAIL_USER = defineSecret('GMAIL_USER');
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');

exports.sendTestPaperEmail = onRequest(
  { secrets: [GMAIL_USER, GMAIL_APP_PASSWORD], cors: true },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    try {
      const { studentName, teacherEmail, testPaperHtml, filename } = req.body || {};
      if (!teacherEmail || !testPaperHtml) {
        res.status(400).json({ error: 'Missing teacherEmail or testPaperHtml' });
        return;
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER.value(),
          pass: GMAIL_APP_PASSWORD.value()
        }
      });

      await transporter.sendMail({
        from: `"Accounting Quiz" <${GMAIL_USER.value()}>`,
        to: teacherEmail,
        subject: `Accounting Test Paper — ${studentName || 'Student'}`,
        text: `Attached is the completed test paper for ${studentName || 'a student'}.`,
        attachments: [
          {
            filename: filename || 'test_paper.doc',
            content: testPaperHtml,
            contentType: 'application/msword'
          }
        ]
      });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);
