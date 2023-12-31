import nodeMailer from "nodemailer";
import { prisma } from "../../../prisma/prisma";
import { createTicketTemp } from "../../../templates/createTicket";


export async function sendTicketCreate(ticket, session) {
  try {
    let mail;
    const emails = await prisma.email.findMany();

    if (emails.length > 0) {
      // if (process.env.NODE_ENV === "development") {
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
      // } 
        await mail.sendMail(
        { from: 'noreply@bnt-soft.com', // sender address
         to: [ticket.email, process.env.ADMIN_EMAIL],
         cc: ticket.cc,
         ...createTicketTemp(ticket)
        });

    }
  } catch (error) {
    return error
  }
}
