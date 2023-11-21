const { prisma } = require("../../../../../prisma/prisma");
import { getSession } from "next-auth/react";
import { sendTicketComment } from "../../../../../lib/nodemailer/ticket/comment";

export default async function handler(req, res) {
  const session = await getSession({ req });
  const { id } = req.query;
  const { text } = req.body;


  try {
    if (session.user) {
      const comment = await prisma.comment.create({
        data: {
          text: text,
          public: Boolean(false),
          ticketId: id,
          userId: session.user.id,
        },
      });

      await prisma.ticket.update({
        where: {
          id: id,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      // fetch ticket id data
      const ticketData = await prisma.ticket.findUnique({
        where: {
          id: id,
        },
      });

      await sendTicketComment(session, comment, ticketData);
      res.status(200).json({ message: "Status Updated", success: true });
    } else {
      res.status(403).json({ message: "You are logged in", success: false });
    }
  } catch (error) {
    return res.status(500).json({ error, success: false });
  }
}
