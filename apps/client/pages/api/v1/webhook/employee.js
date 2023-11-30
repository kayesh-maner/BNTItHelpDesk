
import { isEmpty,omit, pick } from "lodash";
const { prisma } = require("../../../../prisma/prisma");
import { Prisma } from '@prisma/client';
import CryptoJS from 'crypto-js';


const checkMandatoryFields=(reqBody) =>{
  const missingFields =[]
  const mandatoryFields = ["id","email"];
  // Iterate through mandatory fields
  mandatoryFields.forEach((field) => {
    if (!reqBody[field]) {
      missingFields.push(field);
    }
  });
  return missingFields;
}
const checkSchemaFieldsvalidatBody=(body) =>{
  const userModelData=Prisma.dmmf.datamodel.models.find(model => model.name === "User").fields
  const userModelfield = userModelData.map((obj)=>obj.name)
  let validParams = pick(body,userModelfield)
  // lets not update  created at and updated_at and some important things  
  validParams = omit(validParams,['notify_ticket_created','notify_ticket_status_changed','notify_ticket_comments','notify_ticket_assigned'])
  return validParams
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
      res.status(500).json({ message:`mandatory Field missing ${missing_filed}` });
    }
    const {
      id,
      email
    } =req.body

    console.log("\n\n\n req.body",req.body)

    const decrypted = await CryptoJS.AES.decrypt(req.body.encryptedData, 'NidaBandukwale');
    console.log("\n\n\n decrypted",decrypted)

    const str = await decrypted.toString(CryptoJS.enc.Utf8);

    console.log("\n\n\n str",str)
    // ready steady pooo
    let upsertBody =req.body
    upsertBody= checkSchemaFieldsvalidatBody(upsertBody)
    const upsertResp=await prisma.user.upsert({
      where: { id:id,email:email },
      update: {...upsertBody,"updatedAt":new Date()},
      create: {...upsertBody,"updatedAt":new Date(),"createdAt":new Date()},
    });
    res.status(200).json(omit(upsertResp,['password','updatedAt','createdAt']));
  } catch (error) {
    console.log("Something went wrong in v1/webhook/employee.js",error);
    res.status(500).json({ error });
  }
}
