import nodeMailer from "nodemailer";
import { prisma } from "../../../prisma/prisma";
import { closedTicketTemplate } from '../../../templates/closedTicket';
import { reopenTicketTemplate } from "../../../templates/reopenTicket";

export async function sendTicketStatus(ticket, session) {
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
      to: [ticket.email, process.env.ADMIN_EMAIL],
      cc: [ticket.cc],
    }

    let info;
    if(ticket.isComplete){
       info = await mail.sendMail({ ...mailData, ...closedTicketTemplate(ticket) });
    } else {
      info = await mail.sendMail({ ...mailData, ...reopenTicketTemplate(ticket)});
    }
  }
}
