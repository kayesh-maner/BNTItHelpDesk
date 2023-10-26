const { prisma } = require("../../../../prisma/prisma");

export default async function allTickets(req, res) {
  try {
    await prisma.ticket
      .findMany({
        where: {
          isComplete: false,
        },
        orderBy: [{
          createdAt: 'desc'
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
    console.log(error);
    res.status(500);
  }
}
