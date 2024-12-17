const nodemailer = require('nodemailer');
require('dotenv').config();

exports.contact = (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    const mailOptions = {
        from: email,
        to: process.env.GMAIL_USER,
        subject: subject,
        text: `You received a new message from ${name} (${email}):\n ${phone}\n\n${message}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
            res.status(500).send('An error occurred while sending the email.');
        } else {
            console.log('Email sent:', info.response);
            res.send('Your message has been sent successfully!');
        }
    });
}