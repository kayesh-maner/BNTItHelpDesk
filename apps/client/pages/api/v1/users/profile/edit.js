const { prisma } = require("../../../../../prisma/prisma");
import { getSession } from "next-auth/react";

export default async function userProfile(req, res) {
  const session = await getSession({ req });

  try {
    if (session) {
      console.log('req.body>>> \n\n', req.body);
      const { name, email, id } = req.body;
      await prisma.user.update({
        where: { id: id },
        data: {
          name,
          email,
          // language,
        },
      });

      await prisma.user
        .findUnique({
          where: { id: id },
        })
        .then((user) => {
          const { id, name, email, language } = user;
          res.status(200).json({
            user: { id, name, email, language },
          });
        });
    } else {
      res.status(403).json({ message: "unauthenticated", failed: true });
    }
  } catch (error) {
    (error);
    console.log('error>>> \n\n', error);
    res.status(500).json({ error });
  }
}
