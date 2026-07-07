import nodemailer from "nodemailer";

export function createTransport(smtp) {
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });
}

export function buildTaskEmail({ taskName, description }) {
  return {
    subject: `${taskName} [To Do]`,
    text: description || "",
  };
}

export async function sendTaskEmail(smtp, toEmail, { subject, text }) {
  const transporter = createTransport(smtp);
  await transporter.sendMail({
    from: smtp.fromName ? `"${smtp.fromName}" <${smtp.fromEmail}>` : smtp.fromEmail,
    to: toEmail,
    subject,
    text,
  });
}
