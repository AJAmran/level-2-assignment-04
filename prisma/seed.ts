import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const adminPassword = await bcrypt.hash("admin12345", 10);

  // Remove existing users (optional)
  await prisma.user.deleteMany();

  // Create Admin
  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@fixitnow.com",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      phone: "+8801711111111",
      address: "Admin HQ, Dhaka",
      image: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  });

  console.log("─── Seed Complete ───");
  console.log("Admin: admin@fixitnow.com / admin12345");
  console.log("─────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });