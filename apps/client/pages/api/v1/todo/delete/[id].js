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

export default async function deleteTodo(req, res) {

  const { id } = req.query

  try {
     const todo = await doesTodoExist(id);
     
    if (!todo) {
      return res.status(404).json({
        success: false,
        error: "Todo not found.",
      });
    }

    await prisma.todos.delete({
      where: {
        id: id,
      },
    });

    res.status(201).json({ success: true, message: "Todo deleted" });
  } catch (error) {
    (error);
    return res.status(500);
  }
}
