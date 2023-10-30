import nodeMailer from "nodemailer";
import { prisma } from "../../../prisma/prisma";

export async function sendTicketCreate(ticket) {
  try {
    let mail;

    const emails = await prisma.email.findMany();
    console.log('\n\n\n emails', emails);

    if (emails.length > 0) {
      console.log('\n\n\n inside if');
      if (process.env.NODE_ENV === "development") {
        let testAccount = await nodeMailer.createTestAccount();
        mail = nodeMailer.createTransport({
          port: 1025,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });
      } else {
        console.log('\n\n\n else ');
        const email = emails[0];
        mail = nodeMailer.createTransport({
          host: email.host,
          port: email.port,
          secure: email.secure, // true for 465, false for other ports
          auth: {
            user: email.user, // generated ethereal user
            pass: email.pass, // generated ethereal password
          },
        });
      }
      console.log('\n\n\n 36 ticket', ticket);
      let info = await mail.sendMail({
        from: `noreply@bnt-soft.com`, // sender address
        to: ticket.email,
        subject: `Ticket ${ticket.id} has just been created & logged`, // Subject line
        text: `Hello there, Ticket ${ticket.id}, which you reported on ${ticket.createdAt}, has now been created and logged`, // plain text body
        html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html lang="en">
        
          <head>
            <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
          </head>
          <div id="" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Ticket Created<div></div>
          </div>
        
          <body style="background-color:#ffffff;margin:0 auto;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif">
            <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%" style="max-width:600px;margin:0 auto">
              <tr style="width:100%">
                <td>
                  <table style="margin-top:8px" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                    <tbody>
                      <tr>
                        <td><img alt="Slack" src="https://bnt-soft.com/wp-content/uploads/2020/05/logoheader.png" width="130" height="60" style="display:block;outline:none;border:none;text-decoration:none" /></td>
                      </tr>
                    </tbody>
                  </table>
                  <h1 style="color:#1d1c1d;font-size:16px;font-weight:700;margin:10px 0;padding:0;line-height:42px">Ticket Created: ${ticket.id}</h1>
                  <p style="font-size:20px;line-height:28px;margin:4px 0">
                  <p>Hello, <br>Your ticket has now been created and logged.</p>
                  <p style="font-size:14px;margin:16px 0;color:#000">
                  Kind regards, 
                  <br>
                  BNT ticket management
                  </p>
                </td>
              </tr>
            </table>
          </body>
        
        </html>
      `,
      });

      console.log("Message sent: %s", info.messageId);

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodeMailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.log(error);
  }
}
