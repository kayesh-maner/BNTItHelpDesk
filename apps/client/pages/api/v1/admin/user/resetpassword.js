const { prisma } = require("../../../../../prisma/prisma");
import { getSession } from "next-auth/react";

import bcrypt from "bcrypt";

export default async function getAllClients(req, res) {
  const { password, id } = req.body;
  const session = await getSession({ req });

  try {
    if (session.user.isAdmin) {
    // Compare password
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        password: true,
      },
    });
    console.log('\n\n user', user);

     // Compare the provided password with the stored password hash
     bcrypt.compare(password, user.password).then(async (res) => {
      console.log('\n\n res', res);
      if(res === true){
        console.log('\n\n inside if');
        return ({ message: "Password can't be same like previous password", failed: true })
        
      } else{
        console.log('\n\n inside else');
        const hashedPass = await bcrypt.hash(password, 10);
         // Change password
      await prisma.user.update({
        where: { id: id },
        data: {
          password: hashedPass,
        },
      });
      res
        .status(201)
        .json({ message: "password updated success", failed: false });
      }
    })

   
    } else {
      res.status(422).json({ message: "You are not auth'd", failed: true });
    }
  } catch (error) {
    (error);
    res.status(500).json({ error });
  }
}
