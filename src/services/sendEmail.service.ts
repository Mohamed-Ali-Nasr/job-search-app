import { SendEmailServiceParams } from "../types/index.type";
import env from "../utils/validateEnv.util";
import { createTransport } from "nodemailer";

export const sendEmailService = async ({
  to,
  subject,
  textMessage,
  htmlMessage,
  attachments,
}: SendEmailServiceParams) => {
  const transporter = createTransport({
    service: "gmail",
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: true,
    auth: {
      user: env.MAIL_USERNAME,
      pass: env.MAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `No-Reply <${env.MAIL_USERNAME}>`,
    to: to ? to : "",
    subject: subject ? subject : "",
    text: textMessage ? textMessage : "",
    html: htmlMessage ? htmlMessage : "",
    attachments: attachments ? attachments : [],
  });

  return info;
};
