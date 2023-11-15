const { prisma } = require("../../../../prisma/prisma");
import { getSession } from "next-auth/react";

/**
 * @swagger
 * /api/v1/users/email:
 *   get:
 *     tags: [users]
 *     description: Returns all users
 *     responses:
 *       200:
 *         description: Array of all users
 */

export default async function getAllClients(req, res) {
  const session = await getSession({ req });
  try {
    if (session) {
      const users = await prisma.user.findMany({
        where: {
          isAdmin: false,
        },
        select: {
          email: true,
          // name: true,
          id: true,
          // isAdmin: false,
          // language: true,
        },
        orderBy: [{
          createdAt: 'desc'
        }],
      });
console.log('users-email>>>', users);
      res.json({ users, failed: false });
    } else {
      res.status(403).json({ message: "unauthenticated", failed: true });
    }
  } catch (error) {
    (error);
    res.status(500).json({ error });
  }
}