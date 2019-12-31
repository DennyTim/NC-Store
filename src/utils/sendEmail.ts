import nodemailer from 'nodemailer';
import sendgridTransport from 'nodemailer-sendgrid-transport';
import Mail from 'nodemailer/lib/mailer';

export const sendEmail = async ( options ) => {
  const transporter: Mail = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key: process.env.SEND_GRID_API,
      },
    }),
  );

  const message = {
    from: 'shop@node-complete.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);

  global.console.log(info);
};
