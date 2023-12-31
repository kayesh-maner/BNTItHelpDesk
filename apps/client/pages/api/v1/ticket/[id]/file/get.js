const { prisma } = require("../../../../../../prisma/prisma");

export default async function getFiles(req, res) {
  const { id } = req.query;

  try {
    const files = await prisma.ticketFile.findMany({
      where: { ticketId: id },
    });
    res.status(200).json({ sucess: true, files });
  } catch (error) {
    (error);
    return res.status(500).json({ message: error, failed: true });
  }
}
