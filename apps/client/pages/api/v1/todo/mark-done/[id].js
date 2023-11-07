const { prisma } = require("../../../../../prisma/prisma");

const doesTodoExist = async (id) => {
  const exists = await prisma.todos
    .findUnique({
      where: {
        id: id,
      },
    })
    .then(Boolean);

  return exists;
};

export default async function oneDone(req, res) {
  const { id } = req.query;

  try {
    const todo = await doesTodoExist(id);

    (todo);

    if (!todo) {
      return res.status(404).json({
        success: false,
        error: "Todo not found.",
      });
    } else {
      try {
        prisma.todos.update({
          where: {
            id,
          },
          data: {
            done: true,
          },
        });
        ("Updated record");
      } catch (error) {
        (error);
      }
    }

    res.status(201).json({ success: true, message: "Marked as Done" });
  } catch (error) {
    (error);
    return res.status(500);
  }
}
