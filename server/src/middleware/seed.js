import mongoose from "mongoose";
import { AccreditationRequirement, User } from "../models/index.js";
export async function seedUsers() {
  try {
    const existingUsers = await User.countDocuments();

    // Prevent duplicate seeding
    if (existingUsers > 0) {
      console.log("👤 Users already seeded");
      return;
    }

    const hashedPassword = "password123";

    const users = [
      {
        name: "Student Leader",
        email: "studentleader@example.com",
        username: "studentleader",
        deliveryUnit: "CCS",
        password: hashedPassword,
        position: "student-leader",
      },
      {
        name: "Adviser User",
        email: "adviser@example.com",
        username: "adviser",
        deliveryUnit: "CCS",
        password: hashedPassword,
        position: "adviser",
      },
      {
        name: "Dean User",
        email: "dean@example.com",
        username: "dean",
        deliveryUnit: "CCS",
        password: hashedPassword,
        position: "dean",
      },
      {
        name: "OSSD User",
        email: "ossd@example.com",
        username: "ossd",
        deliveryUnit: "OSSD",
        password: hashedPassword,
        position: "ossd coordinator",
      },
      {
        name: "SDU Coordinator",
        email: "sducoordinator@example.com",
        username: "sducoordinator",
        deliveryUnit: "SDU",
        password: hashedPassword,
        position: "sdu-coordinator",
      },
      {
        name: "SDU User",
        email: "sdu@example.com",
        username: "sdu",
        deliveryUnit: "SDU",
        password: hashedPassword,
        position: "sdu",
      },
    ];

    await User.insertMany(users);

    console.log("✅ Seed users created");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  }
}
// -------------------- Seed Accreditation Requirements --------------------
export async function seedAccreditationRequirements() {
  try {
    const templates = [
      { key: "president-info", title: "President's Information" },
      { key: "financial-report", title: "Financial Report" },
      { key: "roster", title: "Members Roster" },
      { key: "accreditation-documents", title: "Accreditation Documents" },
      { key: "action-plan", title: "Action Plan" },
    ];

    for (const tpl of templates) {
      const existing = await AccreditationRequirement.findOne({ key: tpl.key });
      if (!existing) {
        await AccreditationRequirement.create({
          key: tpl.key,
          type: "template",
          title: tpl.title,
          removable: false,
          enabled: true,
        });
        console.log(`✅ Seeded accreditation template: ${tpl.key}`);
      }
    }
  } catch (err) {
    console.error("❌ Error seeding accreditation requirements", err.message);
  }
}
