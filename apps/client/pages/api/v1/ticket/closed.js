const { prisma } = require("../../../../prisma/prisma");
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  try {
    await prisma.ticket
      .findMany({
        where: { 
          isComplete: true,
          userId : session.user.id
        },
        orderBy: [{
          createdAt: 'desc'
        }],
        include: {
          team: {
            select: { id: true, name: true },
          },
        },
      })
      .then((tickets) => {
        res.json({ tickets });
      });
  } catch (error) {
    console.log(error);
    // res.status(500);
  }
}
