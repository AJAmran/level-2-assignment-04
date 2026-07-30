import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const password = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("admin12345", 10);

  // ── Cleanup ──────────────────────────────────────────────────────────────
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.technicianService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.technicianProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@fixitnow.com",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      phone: "+8801711111111",
      address: "Admin HQ, Dhaka",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=SA",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "customer@test.com",
      password,
      role: "CUSTOMER",
      status: "ACTIVE",
      phone: "+8801712345678",
      address: "123 Main St, Dhaka",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=JD",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Jane Smith",
      email: "jane@test.com",
      password,
      role: "CUSTOMER",
      status: "ACTIVE",
      phone: "+8801712345679",
      address: "456 Park Ave, Dhaka",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=JS",
    },
  });

  const techUser1 = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "tech1@test.com",
      password,
      role: "TECHNICIAN",
      status: "ACTIVE",
      phone: "+8801712345680",
      address: "789 Tech Lane, Dhaka",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=AJ",
    },
  });

  const techUser2 = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "tech2@test.com",
      password,
      role: "TECHNICIAN",
      status: "ACTIVE",
      phone: "+8801712345681",
      address: "321 Worker Rd, Dhaka",
      image: "https://api.dicebear.com/9.x/initials/svg?seed=BS",
    },
  });

  // ── Technician Profiles ──────────────────────────────────────────────────
  const tech1 = await prisma.technicianProfile.create({
    data: {
      userId: techUser1.id,
      bio: "Expert plumber and electrician with 5+ years of experience. Reliable and professional service guaranteed.",
      location: "Dhaka",
      experience: 5,
      rating: 4.8,
    },
  });

  const tech2 = await prisma.technicianProfile.create({
    data: {
      userId: techUser2.id,
      bio: "Professional cleaner and painter. I take pride in making your home look its best.",
      location: "Dhaka",
      experience: 3,
      rating: 4.5,
    },
  });

  // ── Categories ───────────────────────────────────────────────────────────
  const plumbing = await prisma.category.create({
    data: { name: "Plumbing", slug: "plumbing" },
  });
  const electrical = await prisma.category.create({
    data: { name: "Electrical", slug: "electrical" },
  });
  const cleaning = await prisma.category.create({
    data: { name: "Cleaning", slug: "cleaning" },
  });
  const painting = await prisma.category.create({
    data: { name: "Painting", slug: "painting" },
  });

  // ── Services (catalog, not tied to a specific technician) ────────────────
  const pipeRepair = await prisma.service.create({
    data: {
      name: "Pipe Repair",
      price: 50,
      categoryId: plumbing.id,
      image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400",
    },
  });

  const wiring = await prisma.service.create({
    data: {
      name: "Wiring Installation",
      price: 80,
      categoryId: electrical.id,
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400",
    },
  });

  const deepClean = await prisma.service.create({
    data: {
      name: "Deep Cleaning",
      price: 40,
      categoryId: cleaning.id,
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
    },
  });

  const wallPaint = await prisma.service.create({
    data: {
      name: "Wall Painting",
      price: 120,
      categoryId: painting.id,
      image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400",
    },
  });

  // ── Technician ↔ Service links ───────────────────────────────────────────
  // Tech1 offers: Pipe Repair, Wiring Installation
  await prisma.technicianService.create({
    data: { technicianId: tech1.id, serviceId: pipeRepair.id },
  });
  await prisma.technicianService.create({
    data: { technicianId: tech1.id, serviceId: wiring.id },
  });

  // Tech2 offers: Deep Cleaning, Wall Painting
  await prisma.technicianService.create({
    data: { technicianId: tech2.id, serviceId: deepClean.id },
  });
  await prisma.technicianService.create({
    data: { technicianId: tech2.id, serviceId: wallPaint.id },
  });

  // ── Slots ────────────────────────────────────────────────────────────────
  const tech1Slots = [
    { startTime: new Date("2026-08-10T09:00:00Z"), endTime: new Date("2026-08-10T11:00:00Z") },
    { startTime: new Date("2026-08-10T14:00:00Z"), endTime: new Date("2026-08-10T16:00:00Z") },
    { startTime: new Date("2026-08-11T10:00:00Z"), endTime: new Date("2026-08-11T12:00:00Z") },
    { startTime: new Date("2026-08-12T09:00:00Z"), endTime: new Date("2026-08-12T11:00:00Z") },
    { startTime: new Date("2026-08-12T15:00:00Z"), endTime: new Date("2026-08-12T17:00:00Z") },
  ];
  for (const slot of tech1Slots) {
    await prisma.slot.create({ data: { technicianId: tech1.id, ...slot } });
  }

  const tech2Slots = [
    { startTime: new Date("2026-08-10T08:00:00Z"), endTime: new Date("2026-08-10T10:00:00Z") },
    { startTime: new Date("2026-08-11T09:00:00Z"), endTime: new Date("2026-08-11T11:00:00Z") },
    { startTime: new Date("2026-08-11T13:00:00Z"), endTime: new Date("2026-08-11T15:00:00Z") },
    { startTime: new Date("2026-08-13T10:00:00Z"), endTime: new Date("2026-08-13T12:00:00Z") },
  ];
  for (const slot of tech2Slots) {
    await prisma.slot.create({ data: { technicianId: tech2.id, ...slot } });
  }

  // ── Bookings (reference slots) ───────────────────────────────────────────
  const booking1Slot = await prisma.slot.findFirstOrThrow({
    where: { technicianId: tech1.id, startTime: new Date("2026-08-12T09:00:00Z") },
  });
  const booking1 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      technicianId: tech1.id,
      serviceId: pipeRepair.id,
      slotId: booking1Slot.id,
      scheduledTime: booking1Slot.startTime,
      address: "123 Main St, Dhaka",
      phone: "+8801712345678",
      status: "REQUESTED",
    },
  });
  await prisma.slot.update({ where: { id: booking1Slot.id }, data: { booking: { connect: { id: booking1.id } } } });

  const booking2Slot = await prisma.slot.findFirstOrThrow({
    where: { technicianId: tech2.id, startTime: new Date("2026-08-11T09:00:00Z") },
  });
  const booking2 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      technicianId: tech2.id,
      serviceId: deepClean.id,
      slotId: booking2Slot.id,
      scheduledTime: booking2Slot.startTime,
      address: "123 Main St, Dhaka",
      phone: "+8801712345678",
      status: "ACCEPTED",
    },
  });
  await prisma.slot.update({ where: { id: booking2Slot.id }, data: { booking: { connect: { id: booking2.id } } } });

  const booking3Slot = await prisma.slot.findFirstOrThrow({
    where: { technicianId: tech1.id, startTime: new Date("2026-08-10T14:00:00Z") },
  });
  const booking3 = await prisma.booking.create({
    data: {
      customerId: customer2.id,
      technicianId: tech1.id,
      serviceId: wiring.id,
      slotId: booking3Slot.id,
      scheduledTime: booking3Slot.startTime,
      address: "456 Park Ave, Dhaka",
      phone: "+8801712345679",
      status: "COMPLETED",
    },
  });
  await prisma.slot.update({ where: { id: booking3Slot.id }, data: { booking: { connect: { id: booking3.id } } } });

  // ── Payment (for completed booking) ──────────────────────────────────────
  await prisma.payment.create({
    data: {
      bookingId: booking3.id,
      transactionId: "TXN-1723000000-DEMO01",
      amount: 80,
      provider: "SSLCOMMERZ",
      status: "COMPLETED",
      paidAt: new Date(),
    },
  });

  // ── Review (for completed booking) ───────────────────────────────────────
  await prisma.review.create({
    data: {
      bookingId: booking3.id,
      customerId: customer2.id,
      technicianId: tech1.id,
      rating: 5,
      comment: "Excellent work! Very professional and punctual.",
    },
  });

  console.log("─── Seed Complete ───");
  console.log(`Admin:       admin@fixitnow.com / admin12345`);
  console.log(`Customer 1:  customer@test.com / password123`);
  console.log(`Customer 2:  jane@test.com / password123`);
  console.log(`Technician 1: tech1@test.com / password123`);
  console.log(`Technician 2: tech2@test.com / password123`);
  console.log(`─────────────────────`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
