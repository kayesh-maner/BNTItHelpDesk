const { prisma } = require("../../../../../prisma/prisma");
import { getSession } from "next-auth/react";

export default async function userOpen(req, res) {
  const session = await getSession({ req });

  try {
    await prisma.ticket
      .findMany({
        where: { isComplete: false },
        include: {
          client: {
            select: { id: true, name: true, number: true },
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
        res.json({ tickets });
      });
  } catch (error) {
    (error);
    res.status(500).json({ error });
  }
}
