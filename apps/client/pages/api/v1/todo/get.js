const { prisma } = require("../../../../prisma/prisma");
import { getSession } from "next-auth/react"


export default async function getTodo(req, res) {
  const session = await getSession({ req })

  // (session)

  try {
    const todos = await prisma.todos.findMany({
      where: { userId: session.user.user.id },
      select: {
        id: true,
        text: true,
        done: true,
      },
    });

    res.status(201).json({ success: true, message: "Todo saved", todos });
  } catch (error) {
    (error);
    return res.status(500);
  }
}
