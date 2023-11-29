
import { isEmpty } from "lodash";
const { prisma } = require("../../../../prisma/prisma");




const checkMandatoryFields=(reqBody) =>{
  const missingFields =[]
  const mandatoryFields = ["email"];
  // Iterate through mandatory fields
  mandatoryFields.forEach((field) => {
    if (!reqBody[field]) {
      missingFields.push(field);
    }
  });
  return missingFields;
}
/**
 * @swagger
 * /api/v1/webhook/employee:
 *   post:
 *     tags: [webhook]
 *     description: Gets all clients 
 *     responses:
 *       200:
 *         description: returns array of clients
 */

export default async function employeeWebhook(req, res) {
  try {
    // lets create some level of security by checking some secrte id maybe
    // will check with crypto.js same has to be working with HRM

    
    //lets check mandatory fields  
    const missing_filed=checkMandatoryFields(req.body)
    if(!isEmpty(missing_filed)){
      // throw error
    }
    console.log("\n\n\n\n req.body",req.body);
    const {
      id,
      email
    } =req.body
    // ready steady pooo
    const upsertBody =req.body
    const upsertResp=await prisma.user.upsert({
      where: { id:id,email:email },
      update: upsertBody,
      create: upsertBody,
    });
    res.status(200).json(upsertResp);
  } catch (error) {
    console.log("\n\n\n\n error",error);
    (error);
    res.status(500).json({ error });
  }
}
