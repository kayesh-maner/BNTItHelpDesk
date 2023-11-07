const { prisma } = require("../../../../../prisma/prisma");
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  try {
    const result = await prisma.ticket.count({
      where: {
        isComplete: false,
        OR: [
          { userId: session.user.id },
          { creator: session.user.id },
        ],
      },
    });

    res.status(200).json({ result });
  } catch (error) {
    (error);
    res.status(500).json({ result });
  }
}
