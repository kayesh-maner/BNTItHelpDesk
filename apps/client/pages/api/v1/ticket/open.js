const { prisma } = require("../../../../prisma/prisma");
import { getSession } from "next-auth/react";

export default async function allTickets(req, res) {
  const session = await getSession({ req });

  try {
    await prisma.ticket
      .findMany({
        where: {
          isComplete: false,
          OR: [
            { userId: session.user.id },
            { creator: session.user.id },
          ],
        },
        orderBy: [{
          updatedAt: 'desc'
        }],
        include: {
          client: {
            select: { id: true, name: true },
          },
          assignedTo: {
            select: { id: true, name: true },
          },
          team: {
            select: { id: true, name: true },
          },
        },
      })
      .then((tickets) => {
        res.status(200).json({ tickets });
      });
  } catch (error) {
    (error);
    res.status(500);
  }
}
