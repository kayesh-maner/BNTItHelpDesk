const { prisma } = require("../../../../../../prisma/prisma");

export default async function handler(req, res) {
  try {
    const result = await prisma.ticket.count({
      where: { isIssued: true, userId: req.user.id },
    });

    res.status(200).json({ result });
  } catch (error) {
    (error);
    res.status(500).json({ result });
  }
}
