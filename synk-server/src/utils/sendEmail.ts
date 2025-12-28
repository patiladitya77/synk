import transporter from "./transporter";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  await transporter.sendMail({
    from: `"Collaborative Whiteboard" <adpatil587@gmail.com>`,
    to,
    subject,
    text,
    html,
  });
};

export default sendEmail;
