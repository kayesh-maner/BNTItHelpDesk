const { prisma } = require("../../../../prisma/prisma");
import { sendTicketCreate } from "../../../../lib/nodemailer/ticket/create";
import { getSession } from "next-auth/react";
const moment = require('moment'); 

// Fetch Todays tickets here
const unique = async() => {
// Fetch Todays Total Ticket Count
const today = new Date();
today.setHours(0, 0, 0, 0); // Set the time to the start of the day

const ticketsCreatedToday = await prisma.ticket.findMany({
  where: {
    AND: [
      {
        createdAt: {
          gte: today, // Greater than or equal to the start of today
        },
      },
      {
        createdAt: {
          lt: new Date(), // Less than the current time, to ensure only today's tickets
        },
      },
    ],
  },
});
  return ticketsCreatedToday.length
}

// Find userId by using email
const uidFromEmail = async(email) => {
  const findEmail = await prisma.user.findMany({
    where: { email: email },
  });
  return findEmail[0].id
}



export default async function createTicket(req, res) {
  const session = await getSession({ req });
  const { name, company, detail, title, priority, email, issue, engineer, category, ccemail, fileAttached } =
    req.body;

  try {
    // generate unique id for the Ticket
    let uid = await unique();
    uid = uid + 1 
    const customId = moment().format('YYYYMMMDD-').toUpperCase() + uid;

    let creator
    if(session.user.isAdmin){
      creator = await uidFromEmail(email)
    }else{
        creator = session.user.id
    }
 
    const ticket = await prisma.ticket
      .create({
        data: {
          id: customId, 
          name,
          title,
          detail,
          priority: priority ? priority : "low",
          issue,
          email,
          creator : creator,
          category,
          cc : ccemail,
          client:
            company !== undefined
              ? {
                  connect: { id: company.id },
                }
              : undefined,
          fromImap: false,
          assignedTo:
            engineer && engineer.name !== "Unassigned"
              ? {
                  connect: { id: engineer.id },
                }
              : undefined,
          isComplete: Boolean(false),
          filePath:fileAttached
        },
      })
     
      if(ticket){
              sendTicketCreate(ticket, session);
      }
    const webhook = await prisma.webhooks.findMany({
      where: {
        type: "ticket_created",
      },
    });

    for (let i = 0; i < webhook.length; i++) {
      if (webhook[i].active === true) {
        (webhook[i].url);
        await fetch(`${webhook[i].url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: `Ticket ${data.id} created by ${data.name} -> ${data.email}. Priority -> ${data.priority}`,
          }),
          redirect: "follow",
        });
      }
    }

    res
      .status(200)
      .json({ message: "Ticket created correctly", success: true, ticket: ticket });
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
}
