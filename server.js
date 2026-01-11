import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tourismguide419@gmail.com',
        pass: 'mrpl gcuv dgjp tpbm'
    }
});

// Feedback endpoint
app.post('/api/feedback', async (req, res) => {
    const { name, email, experience, improvements, issues } = req.body;

    const mailOptions = {
        from: 'tourismguide419@gmail.com',
        to: 'wolfankit512@gmail.com',
        subject: `AlgoVision Feedback from ${name}`,
        html: `
      <h2>New Feedback Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Experience Rating:</strong> ${'⭐'.repeat(experience)} (${experience}/5)</p>
      <p><strong>Suggestions:</strong></p>
      <p>${improvements || 'None provided'}</p>
      <p><strong>Issues Faced:</strong></p>
      <p>${issues || 'None reported'}</p>
      <hr>
      <p style="color: gray; font-size: 12px;">Sent from AlgoVision Feedback Form</p>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Feedback email sent successfully');
        res.json({ success: true, message: 'Feedback sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send feedback' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Feedback server running on http://localhost:${PORT}`);
});
