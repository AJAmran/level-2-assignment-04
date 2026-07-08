import app from "./app";
import { prisma } from "./lib/prisma";
import config from "./config";

const port = config.port;

async function main() {
  try {
    await prisma.$connect();
    console.log("Database Connected Successfully");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  main();
}

export default app;
