const { prisma } = require("../../../../prisma/prisma");

export default async function allDone(req, res) {
  try {
    aprisma.todos
      .updateMany({
        where: {
          userId: req.user.id,
        },
        data: {
          done: true,
        },
      })
      .then((_) => {
        return prisma.todos.findMany({
          where: {
            userId: req.user.id,
          },
        });
      })

    res.status(201).json({ success: true, message: "Mark all as done" });
  } catch (error) {
    (error);
    return res.status(500);
  }
}
