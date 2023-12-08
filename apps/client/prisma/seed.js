const { PrismaClient } = require("@prisma/client");
 
const prisma = new PrismaClient();
 
async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: `admin@admin.com`,
      name: "admin",
      isAdmin: true,
      password: "$2b$10$BFmibvOW7FtY0soAAwujoO9y2tIyB7WEJ2HNq9O7zh9aeejMvRsKu",
      language: "en",
      reporting:""
    },
  });
 
  const internal = await prisma.client.upsert({
    where: { email: `internal@admin.com` },
    update: {},
    create: {
      email: `internal@admin.com`,
      name: "internal",
      contactName: "admin",
      number: "123456789",
      active: true,
    },
  });
 
  const team = await prisma.team.upsert({
    where: { id: '100'},
    update: {},
    create: {
      id: '100',
      name: "BNT"
    },
  });
 
  // const email = await prisma.team.upsert({
  //   where: {id: '100'},
  //   update: {},
  //   create: {
  //     id: '100',
  //     active: 'true',
  //    user : 'noreply@bnt-soft.com',
  //    pass : 'Pad05029',
  //    secure: false,
  //    host: 'smtp.office365.com',
  //    reply: 'noreply@bnt-soft.com',
  //    port: '587',
  //    name: 'bnt'
  //   },
  // });
 
 
  ({ admin, internal, team });
}
 
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });