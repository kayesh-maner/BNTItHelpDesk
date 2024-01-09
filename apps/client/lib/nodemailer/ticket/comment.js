import nodeMailer from 'nodemailer'
import { prisma } from '../../../prisma/prisma'
import { commentTicketTemplate } from '../../../templates/commentTicket'

export async function sendTicketComment(session, comment, ticketData) {
  try {
    let mail

    const emails = await prisma.email.findMany()
    if (emails.length > 0) {
      const emailConfig = emails[0]
      const { host, port, secure, user, pass } = emailConfig
      mail = nodeMailer.createTransport({
        host: host,
        port: port,
        secure: secure,
        auth: {
          user: user,
          pass: pass,
        },
      })

      const mailData = {
        from: 'noreply@bnt-soft.com', // sender address
        to: [ticketData.email, process.env.ADMIN_EMAIL],
        cc: [ticketData.cc],
      }
      let test = await mail.sendMail({
        ...mailData,
        ...commentTicketTemplate(session, comment, ticketData),
      })
      console.log('comment mail var >>>', test)
    }
  } catch (err) {
    console.log('Comment Catch Error >>>', err)
  }
}
