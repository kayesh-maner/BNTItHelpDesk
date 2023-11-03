import nodeMailer from "nodemailer";
import { prisma } from "../../../prisma/prisma";
import { commentTicketTemplate } from '../../../templates/commentTicket';


export async function sendTicketComment(ticket, session) {
  let mail;

  const emails = await prisma.email.findMany();
  if (emails.length > 0) {
      const emailConfig = emails[0];
      const { host, port, secure, user, pass } = emailConfig;
      mail = nodeMailer.createTransport({
        host: host,
        port: port, 
        secure: secure, 
        auth: {
          user: user,
          pass: pass,
        },
      });
    
    const mailData = {
       from: 'noreply@bnt-soft.com', // sender address
      to: [session.user.email],
     // to:  ['ml.itteam@bnt-soft.com', ticket.email],
      // cc: [session.user.email, ticket.email],
    }

      let info = await mail.sendMail({ ...mailData, ...commentTicketTemplate(ticket) });
     
  

    console.log("Message sent: %s", info.messageId);

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodeMailer.getTestMessageUrl(info));
  }
}
