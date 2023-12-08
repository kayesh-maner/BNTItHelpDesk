const { prisma } = require("../../../../../prisma/prisma");
import { getSession } from "next-auth/react";

import bcrypt from "bcrypt";

export default async function getAllClients(req, response) {
  const { password, id } = req.body;
  const session = await getSession({ req });
  try {
    let msg, failed;
    if (session.user.isAdmin) {
      // Compare password
      const user = await prisma.user.findUnique({
        where: { id: id },
        select: {
          password: true,
        },
      });

      // Compare the provided password with the stored password hash
      bcrypt.compare(password, user.password).then(async (passwordMatch) => {
        if (passwordMatch === true) {
          msg = `Whoops! Your new password can't be the same as your previous one. Let's pick something fresh and unique`;
          failed = true;
        } else {
          msg = 'Password updated successfully';
          failed = false;
          const hashedPass = await bcrypt.hash(password, 10);
          // Change password
          await prisma.user.update({
            where: { id: id },
            data: {
              password: hashedPass,
            },
          });
        }
        response.status(201).json({ message: msg, failed: failed });
      });
    } else {
      response.status(422).json({ message: "You are not auth'd", failed: true });
    }
  } catch (error) {
    response.status(500).json({ error });
  }
}
