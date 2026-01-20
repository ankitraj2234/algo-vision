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
        user: process.env.EMAIL_USER || '............',
        pass: process.env.EMAIL_PASS || '..........'
    }
});

// Input sanitization helper to prevent XSS
const sanitizeInput = (str) => {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
};

// Input validation
const validateFeedback = (body) => {
    const { name, email, experience, improvements, issues } = body;

    if (!name || typeof name !== 'string' || name.length > 100) {
        return { valid: false, error: 'Invalid name' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' };
    }

    if (typeof experience !== 'number' || experience < 1 || experience > 5) {
        return { valid: false, error: 'Experience must be 1-5' };
    }

    if (improvements && (typeof improvements !== 'string' || improvements.length > 2000)) {
        return { valid: false, error: 'Improvements text too long' };
    }

    if (issues && (typeof issues !== 'string' || issues.length > 2000)) {
        return { valid: false, error: 'Issues text too long' };
    }

    return { valid: true };
};

// Feedback endpoint with validation and sanitization
app.post('/api/feedback', async (req, res) => {
    // Validate input
    const validation = validateFeedback(req.body);
    if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.error });
    }

    const { name, email, experience, improvements, issues } = req.body;

    // Sanitize all user input before putting in HTML
    const safeName = sanitizeInput(name);
    const safeEmail = sanitizeInput(email);
    const safeImprovements = sanitizeInput(improvements);
    const safeIssues = sanitizeInput(issues);

    const mailOptions = {
        from: process.env.EMAIL_USER || 'tourismguide419@gmail.com',
        to: process.env.RECIPIENT_EMAIL || 'wolfankit512@gmail.com',
        subject: `AlgoVision Feedback from ${safeName}`,
        html: `
      <h2>New Feedback Received</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Experience Rating:</strong> ${'⭐'.repeat(experience)} (${experience}/5)</p>
      <p><strong>Suggestions:</strong></p>
      <p>${safeImprovements || 'None provided'}</p>
      <p><strong>Issues Faced:</strong></p>
      <p>${safeIssues || 'None reported'}</p>
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
