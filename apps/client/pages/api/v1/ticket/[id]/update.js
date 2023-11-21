const { prisma } = require("../../../../../prisma/prisma");

export default async function updateTicket(req, res) {
  const { id } = req.query;

  const { note, detail, title, priority, status } = req.body;

  try {
    
    await prisma.ticket.update({
      where: { id: id },
      data: {
        detail,
        note,
        title,
        priority,
        status,
        updatedAt: new Date()
      },
    });


    res.status(201).json({ success: true, message: "Ticket saved" });
  } catch (error) {
    (error);
    return res.status(500);
  }
}
