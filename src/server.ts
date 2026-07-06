import express, { type Express, type Request, type Response } from "express";
import app from "./app";
import { prisma } from "./lib/prisma";

const port = 5000;

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

main();
