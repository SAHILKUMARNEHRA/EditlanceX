const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const apps = await prisma.application.findMany({
      include: { 
        editor: { select: { id: true, name: true, email: true, editorProfile: true } },
        job: { select: { id: true, title: true } }
      }
    });
    console.log("Apps OK");

    const reqs = await prisma.directRequest.findMany({
      include: { editor: { select: { id: true, name: true, email: true, editorProfile: true } } }
    });
    console.log("Reqs OK");
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
