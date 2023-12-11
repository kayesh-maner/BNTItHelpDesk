const { prisma } = require("../../../../../prisma/prisma");
import { getSession } from "next-auth/react";
import { sendTicketStatus } from "../../../../../lib/nodemailer/ticket/status";

export default async function completeTicket(req, res) {
  const { id } = req.query;

  const { status } = req.body;
  const session = await getSession({ req });
  let updateData = {
    isComplete: status,
    updatedAt: new Date(),
  };

  if (status === true) {
    updateData = {
      isComplete: status,
      updatedAt: new Date(),
      closeAt: new Date(),
    };
  }
  
  try {
    await prisma.ticket
      .update({
        where: { id: id },
        data : updateData
      })
      .then(async (ticket) => {
        await sendTicketStatus(ticket, session);
      });

    const webhook = await prisma.webhooks.findMany({
      where: {
        type: "ticket_status_changed",
      },
    });

    for (let i = 0; i < webhook.length; i++) {
      if (webhook[i].active === true) {
        const s = status ? "Completed" : "Outstanding";
        await fetch(`${webhook[i].url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: `Ticket ${data.id} created by ${data.email}, has had it's status changed to ${s}`,
          }),
          redirect: "follow",
        });
      }
    }

    res.status(200).json({ message: "Status Updated" });
  } catch (error) {
    (error);
    return res.status(500);
  }
}
