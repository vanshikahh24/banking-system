const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Error connecting to email server:", error);
    } else {
        console.log("Email server is ready to send messages");
    }
});


const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Banking System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });

        console.log("Message sent:", info.messageId);

    } catch (error) {
        console.error("Error sending email:", error);
    }
};


async function sendRegistrationEmail(userEmail, name) {

    const subject = "Welcome to Banking System";

    const text = `Hello ${name},

Thank you for registering at Banking System.

We are excited to have you on board!

Best regards,
The Banking System Team`;

    const html = `
        <h2>Hello ${name},</h2>

        <p>
            Thank you for registering at Banking System.
        </p>

        <p>
            We are excited to have you on board!
        </p>

        <p>
            Best regards,<br>
            The Banking System Team
        </p>
    `;

    await sendEmail(
        userEmail,
        subject,
        text,
        html
    );
}


module.exports = {
    sendRegistrationEmail
};