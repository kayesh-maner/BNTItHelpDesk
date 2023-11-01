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

export default async function createTicket(req, res) {
  const session = await getSession({ req });
  const { name, company, detail, title, priority, email, issue, engineer } =
    req.body;
  try {
   
    // generate unique id for the Ticket
    let uid = await unique();
    uid = uid + 1 
    const customId = moment().format('YYYYMMMDD-') + uid;
    
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
          creator : session.user.id,
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
        },
      })
      .then((ticket) => {
        sendTicketCreate(ticket, session);
      });

    const webhook = await prisma.webhooks.findMany({
      where: {
        type: "ticket_created",
      },
    });

    for (let i = 0; i < webhook.length; i++) {
      if (webhook[i].active === true) {
        console.log(webhook[i].url);
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
    console.log(error);
    res.status(500).json({ error, success: false });
  }
}
