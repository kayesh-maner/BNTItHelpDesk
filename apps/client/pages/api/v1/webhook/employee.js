import {isEmpty,omit,pick} from "lodash";
const { prisma} = require("../../../../prisma/prisma");
import {  Prisma} from '@prisma/client';
const bcrypt = require('bcrypt');

const checkMandatoryFields = (reqBody) => {
  const missingFields = []
  const mandatoryFields = ["id", "email"];
  // Iterate through mandatory fields
  mandatoryFields.forEach((field) => {
      if (!reqBody[field]) {
          missingFields.push(field);
      }
  });
  return missingFields;
}
const checkSchemaFieldsvalidatBody = (body) => {
  const userModelData = Prisma.dmmf.datamodel.models.find(model => model.name === "User").fields
  const userModelfield = userModelData.map((obj) => obj.name)
  let validParams = pick(body, userModelfield)
  // lets not update  created at and updated_at and some important things  
  validParams = omit(validParams, ['notify_ticket_created', 'notify_ticket_status_changed', 'notify_ticket_comments', 'notify_ticket_assigned'])
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
        const {
            id,
            email,
            SecretKey
        } = req.body

        console.log('\n\n\n req.body',req.body);

        //Lets create a hash password
        const saltRounds = 10;
        const plainTextPassword = 'bntsoft@12';

        try{
            let hash =  await bcrypt.hash(plainTextPassword, saltRounds)
            console.log('Text Password:', plainTextPassword);
            console.log('Bcrypt Hash:', hash);
            req.body.password = hash;
        } catch (error) {
                console.error('Error while generating hash:', error);
        }

        //lets check the security key shared by hRM
        if (SecretKey !== 'bntsoftItHelpdesk12') {
            throw new Error('Missing or incorrect SecretKey');
        }

      //lets check mandatory fields  
      const missing_filed = checkMandatoryFields(req.body)
      if (!isEmpty(missing_filed)) {
          // throw error
          res.status(500).json({
              message: `mandatory Field missing ${missing_filed}`
          });
      }
      // ready steady pooo
      let upsertBody = req.body
      upsertBody = checkSchemaFieldsvalidatBody(upsertBody)
      const upsertResp = await prisma.user.upsert({
          where: {
              id: id,
              email: email
          },
          update: {
              ...upsertBody,
              "updatedAt": new Date()
          },
          create: {
              ...upsertBody,
              "updatedAt": new Date(),
              "createdAt": new Date()
          },
      });
      res.status(200).json(omit(upsertResp, ['password', 'updatedAt', 'createdAt']));
  } catch (error) {
      console.log("Something went wrong in v1/webhook/employee.js\n\n\n", error);
      res.status(500).json({
          error
      });
  }
}