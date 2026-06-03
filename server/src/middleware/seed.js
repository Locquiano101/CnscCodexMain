import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import * as models from "../models/index.js";

// ── Load .env ──────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, ".env") });

const MONGO_URI = process.env.MONGO_URI;
const FRESH = process.argv.includes("--fresh");

// ── Helper ──────────────────────────────────────────────────────────────────
function log(msg) {
  console.log(`  ${msg}`);
}

function section(title) {
  const lineLength = Math.max(0, 50 - title.length);
  // console.log(`\n── ${title} ${"─".repeat(lineLength)}`);
}

// ── Main seed function ──────────────────────────────────────────────────────
export async function seed() {
  console.log(`\nConnected to MongoDB: ${MONGO_URI}`);

  if (FRESH) {
    console.log("\nFRESH mode: dropping all collections...");
    await mongoose.connection.dropDatabase();
    console.log("  Database dropped.");
  }

  // ── 1. AccreditationRequirements (5 core templates) ──────────────────────
  section("AccreditationRequirement");
  const requirementTemplates = [
    {
      key: "president-info",
      title: "President's Information",
      description: "Profile of the current organization president.",
    },
    {
      key: "financial-report",
      title: "Financial Report",
      description: "Cash flows, transactions, and collection fees.",
    },
    {
      key: "roster",
      title: "Members Roster",
      description: "Complete list of registered organization members.",
    },
    {
      key: "accreditation-documents",
      title: "Accreditation Documents",
      description:
        "Joint Statement, Pledge Against Hazing, Constitution & By-Laws.",
    },
    {
      key: "action-plan",
      title: "Action Plan",
      description: "Proposed activities and programs for the academic year.",
    },
  ];
  for (const tpl of requirementTemplates) {
    const existing = await models.AccreditationRequirement.findOne({
      key: tpl.key,
    });
    if (!existing) {
      await models.AccreditationRequirement.create({
        ...tpl,
        type: "template",
        removable: false,
        enabled: true,
      });
    }
  }

  // ── 2. RoomLocations ──────────────────────────────────────────────────────
  section("RoomLocation");
  const rooms = [
    {
      name: "Conference Hall A",
      building: "Admin Building",
      campus: "Main Campus",
      type: "hall",
      capacity: 100,
      notes: "Main conference hall for large events.",
    },
    {
      name: "CCMS Lab 1",
      building: "CCMS Building",
      campus: "Main Campus",
      type: "lab",
      capacity: 40,
      notes: "Computer lab for CCMS students.",
    },
    {
      name: "CCMS Lab 2",
      building: "CCMS Building",
      campus: "Main Campus",
      type: "lab",
      capacity: 40,
    },
    {
      name: "Covered Court",
      building: null,
      campus: "Main Campus",
      type: "outdoor",
      capacity: 500,
      notes: "Outdoor court for large gatherings.",
    },
    {
      name: "AVR Room",
      building: "Main Building",
      campus: "Main Campus",
      type: "room",
      capacity: 80,
      notes: "Audio-visual room for presentations.",
    },
    {
      name: "College Library",
      building: "Library Building",
      campus: "Main Campus",
      type: "room",
      capacity: 60,
    },
    {
      name: "Gymnasium",
      building: "Gymnasium",
      campus: "Main Campus",
      type: "hall",
      capacity: 800,
      notes: "Main gymnasium for school-wide events.",
    },
    {
      name: "Engineering Lab",
      building: "Engineering Bldg",
      campus: "Main Campus",
      type: "lab",
      capacity: 35,
    },
    {
      name: "Open Amphitheater",
      building: null,
      campus: "Annex Campus",
      type: "outdoor",
      capacity: 300,
      notes: "Outdoor stage for cultural activities.",
    },
  ];
  for (const room of rooms) {
    const result = await models.RoomLocation.updateOne(
      {
        name: room.name.trim(),
        campus: room.campus.trim(),
      },
      {
        $setOnInsert: {
          ...room,
          name: room.name.trim(),
          campus: room.campus.trim(),
        },
      },
      { upsert: true },
    );
  }

  // ── 3. Users (all roles) ──────────────────────────────────────────────────
  section("Users");
  const PASSWORD = "password123";
  const userSeeds = [
    {
      name: "SDU Admin",
      email: "sdu@cnsc.edu.ph",
      username: "sdu_admin",
      deliveryUnit: "SDU",
      position: "sdu",
    },
    {
      name: "SDU Coordinator",
      email: "sducoordinator@cnsc.edu.ph",
      username: "sdu_coordinator",
      deliveryUnit: "SDU",
      position: "sdu-coordinator",
    },
    {
      name: "Dean CCMS",
      email: "dean.ccms@cnsc.edu.ph",
      username: "dean_ccms",
      deliveryUnit: "College of Computing and Multimedia Studies",
      position: "dean",
    },
    {
      name: "Dean COE",
      email: "dean.coe@cnsc.edu.ph",
      username: "dean_coe",
      deliveryUnit: "College of Engineering",
      position: "dean",
    },
    {
      name: "OSSD Coordinator",
      email: "ossd@cnsc.edu.ph",
      username: "ossd_coord",
      deliveryUnit: "OSSD",
      position: "ossd coordinator",
    },
    {
      name: "Student Leader 1",
      email: "student.leader1@cnsc.edu.ph",
      username: "student_leader1",
      deliveryUnit: "College of Computing and Multimedia Studies",
      position: "student-leader",
    },
    {
      name: "Student Leader 2",
      email: "student.leader2@cnsc.edu.ph",
      username: "student_leader2",
      deliveryUnit: "College of Engineering",
      position: "student-leader",
    },
  ];
  const createdUsers = {};
  for (const u of userSeeds) {
    let user = await models.User.findOne({ email: u.email });
    if (!user) {
      user = await models.User.create({
        ...u,
        password: PASSWORD,
        firstLogin: false,
      });
    }
    createdUsers[u.username] = user;
  }

  // ── 4. Advisers ───────────────────────────────────────────────────────────
  section("Advisers");
  const adviserSeeds = [
    {
      name: "Adviser CCMS",
      email: "adviser.ccms@cnsc.edu.ph",
      username: "adviser_ccms",
      deliveryUnit: "College of Computing and Multimedia Studies",
      position: "adviser",
    },
    {
      name: "Adviser COE",
      email: "adviser.coe@cnsc.edu.ph",
      username: "adviser_coe",
      deliveryUnit: "College of Engineering",
      position: "adviser",
    },
  ];
  const createdAdvisers = {};
  for (const a of adviserSeeds) {
    let adviser = await models.Adviser.findOne({ email: a.email });
    if (!adviser) {
      adviser = await models.Adviser.create({
        ...a,
        password: PASSWORD,
        firstLogin: false,
      });
      log(`Created adviser: ${a.email}`);
    }
    createdAdvisers[a.username] = adviser;
  }

  // ── 5. Organizations ──────────────────────────────────────────────────────
  section("Organizations");
  const orgSeeds = [
    {
      originalName: "Computer Science Society",
      currentName: "Computer Science Society",
      establishedDate: new Date("2010-06-01"),
      yearsOfExistence: 14,
      accreditedSince: new Date("2011-06-01"),
    },
    {
      originalName: "Civil Engineering Society",
      currentName: "Civil Engineering Society",
      establishedDate: new Date("2008-06-01"),
      yearsOfExistence: 16,
      accreditedSince: new Date("2009-06-01"),
    },
    {
      originalName: "CNSC Supreme Student Government",
      currentName: "CNSC Supreme Student Government",
      establishedDate: new Date("2000-06-01"),
      yearsOfExistence: 24,
      accreditedSince: new Date("2001-06-01"),
    },
  ];
  const createdOrgs = {};
  for (const o of orgSeeds) {
    let org = await models.Organization.findOne({
      originalName: o.originalName,
    });
    if (!org) {
      org = await models.Organization.create(o);
      log(`Created organization: ${o.currentName}`);
    }
    createdOrgs[o.originalName] = org;
  }

  // ── 6. OrganizationProfiles ───────────────────────────────────────────────
  section("OrganizationProfile");
  const profileSeeds = [
    {
      orgName: "Computer Science Society",
      orgAcronym: "CSS",
      orgClass: "Academic",
      orgCourse: "Bachelor of Science in Information Technology",
      orgDepartment: "College of Computing and Multimedia Studies",
      orgStatus: "Active",
      orgSpecialization: "Academic",
      yearsOfExistence: 14,
      accreditedSince: new Date("2011-06-01"),
      isActive: true,
      isAllowedForAccreditation: true,
      overAllStatus: "Approved",
      orgKey: "Computer Science Society",
      adviserKey: "adviser_ccms",
      userKey: "student_leader1",
    },
    {
      orgName: "Civil Engineering Society",
      orgAcronym: "CES",
      orgClass: "Academic",
      orgCourse: "Bachelor of Science in Civil Engineering",
      orgDepartment: "College of Engineering",
      orgStatus: "Active",
      orgSpecialization: "Academic",
      yearsOfExistence: 16,
      accreditedSince: new Date("2009-06-01"),
      isActive: true,
      isAllowedForAccreditation: true,
      overAllStatus: "Pending",
      orgKey: "Civil Engineering Society",
      adviserKey: "adviser_coe",
      userKey: "student_leader2",
    },
    {
      orgName: "CNSC Supreme Student Government",
      orgAcronym: "SSG",
      orgClass: "Government",
      orgCourse: "All Courses",
      orgDepartment: "College of Arts and Sciences",
      orgStatus: "Active",
      orgSpecialization: "Student government",
      yearsOfExistence: 24,
      accreditedSince: new Date("2001-06-01"),
      isActive: true,
      isAllowedForAccreditation: false,
      overAllStatus: "Approved",
      orgKey: "CNSC Supreme Student Government",
      adviserKey: "adviser_ccms",
      userKey: "student_leader1",
    },
  ];

  const createdProfiles = {};
  for (const p of profileSeeds) {
    const { orgKey, adviserKey, userKey, ...profileData } = p;
    let profile = await models.OrganizationProfile.findOne({
      orgName: profileData.orgName,
    });
    if (!profile) {
      profile = await models.OrganizationProfile.create({
        ...profileData,
        organization: createdOrgs[orgKey]?._id,
        adviser: createdAdvisers[adviserKey]?._id,
      });
      await models.Organization.findByIdAndUpdate(createdOrgs[orgKey]._id, {
        $addToSet: { organizationProfile: profile._id },
      });
      if (createdUsers[userKey]) {
        await models.User.findByIdAndUpdate(createdUsers[userKey]._id, {
          organizationProfile: profile._id,
          Organization: createdOrgs[orgKey]._id,
        });
      }
      log(`Created profile: ${profileData.orgName}`);
    }
    createdProfiles[orgKey] = profile;
  }

  // ── 7. PresidentProfiles ──────────────────────────────────────────────────
  section("PresidentProfile");
  const presidentSeeds = [
    {
      orgKey: "Computer Science Society",
      name: "Juan dela Cruz",
      department: "College of Computing and Multimedia Studies",
      course: "Bachelor of Science in Information Technology",
      year: "4th Year",
      age: 22,
      sex: "Male",
      religion: "Roman Catholic",
      nationality: "Filipino",
      birthplace: "Daet, Camarines Norte",
      presentAddress: {
        street: "123 Rizal St",
        barangay: "Lag-on",
        municipality: "Daet",
        province: "Camarines Norte",
      },
      permanentAddress: {
        street: "123 Rizal St",
        barangay: "Lag-on",
        municipality: "Daet",
        province: "Camarines Norte",
      },
      parentGuardian: "Maria dela Cruz",
      sourceOfFinancialSupport: "Parents",
      contactNo: "09171234567",
      facebookAccount: "juan.delacruz",
      overAllStatus: "Approved",
      isActive: true,
      classSchedule: [
        {
          subject: "Capstone Project",
          place: "CCMS Lab 1",
          time: { start: "8:00 AM", end: "11:00 AM" },
          day: "Monday",
        },
        {
          subject: "Software Engineering",
          place: "CCMS Lab 2",
          time: { start: "1:00 PM", end: "4:00 PM" },
          day: "Wednesday",
        },
      ],
      talentSkills: [
        { skill: "Programming", level: "Expert" },
        { skill: "Leadership", level: "Intermediate" },
      ],
    },
    {
      orgKey: "Civil Engineering Society",
      name: "Maria Santos",
      department: "College of Engineering",
      course: "Bachelor of Science in Civil Engineering",
      year: "4th Year",
      age: 21,
      sex: "Female",
      religion: "Roman Catholic",
      nationality: "Filipino",
      birthplace: "Jose Panganiban, Camarines Norte",
      presentAddress: {
        street: "45 Magsaysay Ave",
        barangay: "Camambugan",
        municipality: "Daet",
        province: "Camarines Norte",
      },
      permanentAddress: {
        street: "45 Magsaysay Ave",
        barangay: "Camambugan",
        municipality: "Daet",
        province: "Camarines Norte",
      },
      parentGuardian: "Jose Santos",
      sourceOfFinancialSupport: "Scholarship",
      contactNo: "09187654321",
      facebookAccount: "maria.santos.cnsc",
      overAllStatus: "Pending",
      isActive: true,
      classSchedule: [
        {
          subject: "Structural Analysis",
          place: "Engineering Lab",
          time: { start: "7:00 AM", end: "10:00 AM" },
          day: "Tuesday",
        },
      ],
      talentSkills: [{ skill: "AutoCAD", level: "Expert" }],
    },
  ];

  const createdPresidents = {};
  for (const pres of presidentSeeds) {
    const { orgKey, ...presData } = pres;
    const profile = createdProfiles[orgKey];
    const org = createdOrgs[orgKey];
    if (!profile) continue;
    let president = await models.PresidentProfile.findOne({
      organizationProfile: profile._id,
    });
    if (!president) {
      president = await models.PresidentProfile.create({
        ...presData,
        organizationProfile: profile._id,
        organization: org._id,
      });
      await models.OrganizationProfile.findByIdAndUpdate(profile._id, {
        orgPresident: president._id,
      });
      log(`Created president: ${presData.name}`);
    }
    createdPresidents[orgKey] = president;
  }

  // ── 8. Rosters & RosterMembers ────────────────────────────────────────────
  section("Roster + RosterMembers");
  const rosterSeed = [
    {
      orgKey: "Computer Science Society",
      overAllStatus: "Approved",
      isComplete: true,
      members: [
        {
          name: "Juan dela Cruz",
          email: "jdelacruz@cnsc.edu.ph",
          position: "President",
          course: "Bachelor of Science in Information Technology",
          year: "4th",
          department: "College of Computing and Multimedia Studies",
          studentId: "2021-00001",
          contactNumber: "09171234567",
          status: "Active",
        },
        {
          name: "Ana Reyes",
          email: "areyes@cnsc.edu.ph",
          position: "Vice President",
          course: "Bachelor of Science in Information Technology",
          year: "3rd",
          department: "College of Computing and Multimedia Studies",
          studentId: "2021-00002",
          contactNumber: "09172345678",
          status: "Active",
        },
        {
          name: "Carlo Manalo",
          email: "cmanalo@cnsc.edu.ph",
          position: "Secretary",
          course: "Bachelor of Science in Information Systems",
          year: "3rd",
          department: "College of Computing and Multimedia Studies",
          studentId: "2021-00003",
          contactNumber: "09173456789",
          status: "Active",
        },
        {
          name: "Liza Torres",
          email: "ltorres@cnsc.edu.ph",
          position: "Treasurer",
          course: "Bachelor of Science in Information Systems",
          year: "2nd",
          department: "College of Computing and Multimedia Studies",
          studentId: "2021-00004",
          contactNumber: "09174567890",
          status: "Active",
        },
        {
          name: "Mark Villanueva",
          email: "mvillanueva@cnsc.edu.ph",
          position: "Auditor",
          course: "Bachelor of Science in Information Technology",
          year: "2nd",
          department: "College of Computing and Multimedia Studies",
          studentId: "2021-00005",
          contactNumber: "09175678901",
          status: "Active",
        },
        {
          name: "Grace Perez",
          email: "gperez@cnsc.edu.ph",
          position: "PIO",
          course: "Bachelor of Science in Information Technology",
          year: "3rd",
          department: "College of Computing and Multimedia Studies",
          studentId: "2021-00006",
          contactNumber: "09176789012",
          status: "Active",
        },
        {
          name: "Ryan Dela Torre",
          email: "rdelatorre@cnsc.edu.ph",
          position: "Member",
          course: "Bachelor of Science in Information Systems",
          year: "1st",
          department: "College of Computing and Multimedia Studies",
          studentId: "2022-00007",
          contactNumber: "09177890123",
          status: "Active",
        },
        {
          name: "Sofia Aquino",
          email: "saquino@cnsc.edu.ph",
          position: "Member",
          course: "Bachelor of Science in Information Technology",
          year: "1st",
          department: "College of Computing and Multimedia Studies",
          studentId: "2022-00008",
          contactNumber: "09178901234",
          status: "Active",
        },
      ],
    },
    {
      orgKey: "Civil Engineering Society",
      overAllStatus: "Pending",
      isComplete: false,
      members: [
        {
          name: "Maria Santos",
          email: "msantos@cnsc.edu.ph",
          position: "President",
          course: "Bachelor of Science in Civil Engineering",
          year: "4th",
          department: "College of Engineering",
          studentId: "2021-00010",
          contactNumber: "09187654321",
          status: "Active",
        },
        {
          name: "Pedro Lim",
          email: "plim@cnsc.edu.ph",
          position: "Vice President",
          course: "Bachelor of Science in Civil Engineering",
          year: "3rd",
          department: "College of Engineering",
          studentId: "2021-00011",
          contactNumber: "09188765432",
          status: "Active",
        },
        {
          name: "Elena Cruz",
          email: "ecruz@cnsc.edu.ph",
          position: "Secretary",
          course: "Bachelor of Science in Civil Engineering",
          year: "3rd",
          department: "College of Engineering",
          studentId: "2021-00012",
          contactNumber: "09189876543",
          status: "Active",
        },
        {
          name: "Ramon Garcia",
          email: "rgarcia@cnsc.edu.ph",
          position: "Treasurer",
          course: "Bachelor of Science in Civil Engineering",
          year: "2nd",
          department: "College of Engineering",
          studentId: "2021-00013",
          contactNumber: "09180987654",
          status: "Active",
        },
        {
          name: "Carla Bautista",
          email: "cbautista@cnsc.edu.ph",
          position: "Member",
          course: "Bachelor of Science in Civil Engineering",
          year: "1st",
          department: "College of Engineering",
          studentId: "2022-00014",
          contactNumber: "09181098765",
          status: "Active",
        },
      ],
    },
  ];

  const createdRosters = {};
  for (const rs of rosterSeed) {
    const { orgKey, members, ...rosterData } = rs;
    const profile = createdProfiles[orgKey];
    const org = createdOrgs[orgKey];
    if (!profile) continue;
    let roster = await models.Roster.findOne({
      organizationProfile: profile._id,
    });
    if (!roster) {
      roster = await models.Roster.create({
        ...rosterData,
        organizationProfile: profile._id,
        organization: org._id,
      });
      for (const m of members) {
        await models.RosterMember.create({ ...m, roster: roster._id });
      }
      log(`Created roster for ${orgKey} with ${members.length} members`);
    }
    createdRosters[orgKey] = roster;
  }

  // ── 9. Documents (sample) ─────────────────────────────────────────────────
  section("Documents");
  const docSeeds = [
    {
      orgKey: "Computer Science Society",
      label: "Joint Statement",
      fileName: "joint_statement_css_2024.pdf",
      status: "Approved",
    },
    {
      orgKey: "Computer Science Society",
      label: "Pledge Against Hazing",
      fileName: "pledge_against_hazing_css_2024.pdf",
      status: "Approved",
    },
    {
      orgKey: "Computer Science Society",
      label: "Constitution & By-Laws",
      fileName: "constitution_css_2024.pdf",
      status: "Approved",
    },
    {
      orgKey: "Civil Engineering Society",
      label: "Joint Statement",
      fileName: "joint_statement_ces_2024.pdf",
      status: "Pending",
    },
  ];
  const createdDocs = {};
  for (const d of docSeeds) {
    const { orgKey, ...docData } = d;
    const profile = createdProfiles[orgKey];
    const org = createdOrgs[orgKey];
    if (!profile) continue;
    let doc = await models.Document.findOne({ fileName: docData.fileName });
    if (!doc) {
      doc = await models.Document.create({
        ...docData,
        organizationProfile: profile._id,
        organization: org._id,
      });
      log(`Created document: ${docData.label} for ${orgKey}`);
    }
    if (!createdDocs[orgKey]) createdDocs[orgKey] = {};
    createdDocs[orgKey][docData.label] = doc;
  }

  // ── 10. Financial Reports ─────────────────────────────────────────────────
  section("FinancialReport + CollectibleFee + CashInflow + Receipts");
  const finSeeds = [
    {
      orgKey: "Computer Science Society",
      initialBalance: 10000,
      endingBalance: 8500,
      isActive: true,
      fees: [
        {
          title: "Membership Fee",
          amount: 150,
          description: "Annual membership fee for AY 2024-2025",
          isCollected: true,
          status: "CHECKED",
        },
        {
          title: "Activity Fund",
          amount: 100,
          description: "Fund for planned activities",
          isCollected: false,
          status: "UNCHECKED",
        },
      ],
      cashInflows: [{ paidRosterMembers: 8, amount: 1200 }],
      receipts: [
        {
          description: "T-Shirt Printing for org members",
          amount: 800,
          expenseType: "Supplies",
          date: new Date("2024-09-15"),
        },
        {
          description: "Snacks for general assembly",
          amount: 500,
          expenseType: "Food",
          date: new Date("2024-10-01"),
        },
        {
          description: "Tarpaulin for event",
          amount: 200,
          expenseType: "Supplies",
          date: new Date("2024-10-10"),
        },
      ],
    },
    {
      orgKey: "Civil Engineering Society",
      initialBalance: 7500,
      endingBalance: 7500,
      isActive: true,
      fees: [
        {
          title: "Membership Fee",
          amount: 200,
          description: "Annual membership fee for AY 2024-2025",
          isCollected: false,
          status: "UNCHECKED",
        },
      ],
      cashInflows: [],
      receipts: [],
    },
  ];

  for (const fin of finSeeds) {
    const { orgKey, fees, cashInflows: inflows, receipts, ...finData } = fin;
    const profile = createdProfiles[orgKey];
    if (!profile) continue;
    let report = await models.FinancialReport.findOne({
      organizationProfile: profile._id,
    });
    if (!report) {
      const feeIds = [];
      for (const fee of fees) {
        const f = await models.collectibleFee.create({
          ...fee,
          organizationProfile: profile._id,
        });
        feeIds.push(f._id);
      }
      const inflowIds = [];
      for (let i = 0; i < inflows.length; i++) {
        const inflow = await models.cashInflows.create({
          ...inflows[i],
          organizationProfile: profile._id,
          collectibleFee: feeIds[i] || undefined,
          date: new Date(),
        });
        inflowIds.push(inflow._id);
      }
      const receiptIds = [];
      for (const r of receipts) {
        const rec = await models.Receipt.create({
          ...r,
          organizationProfile: profile._id,
        });
        receiptIds.push(rec._id);
      }
      report = await models.FinancialReport.create({
        ...finData,
        organizationProfile: profile._id,
        collectibleFees: feeIds,
        cashInflows: inflowIds,
        cashoutflows: receiptIds,
      });
      log(`Created financial report for ${orgKey}`);
    }
  }

  // ── 11. Accreditations ────────────────────────────────────────────────────
  section("Accreditations");
  for (const orgKey of Object.keys(createdProfiles)) {
    const profile = createdProfiles[orgKey];
    let accred = await models.Accreditation.findOne({
      organizationProfile: profile._id,
    });
    if (!accred) {
      const docs = createdDocs[orgKey] || {};
      accred = await models.Accreditation.create({
        organizationProfile: profile._id,
        overallStatus:
          profile.overAllStatus === "Approved" ? "Approved" : "Pending",
        isActive: true,
        isRevoked: false,
        Roster: createdRosters[orgKey]?._id,
        PresidentProfile: createdPresidents[orgKey]?._id,
        JointStatement: docs["Joint Statement"]?._id,
        PledgeAgainstHazing: docs["Pledge Against Hazing"]?._id,
        ConstitutionAndByLaws: docs["Constitution & By-Laws"]?._id,
      });
      log(`Created accreditation for ${orgKey}`);
    }
  }

  // ── 12. RequirementSubmissions ────────────────────────────────────────────
  section("RequirementSubmission");
  const cssProfile = createdProfiles["Computer Science Society"];
  if (cssProfile) {
    const submissionSeeds = [
      { requirementKey: "president-info", status: "Approved" },
      { requirementKey: "roster", status: "Approved" },
      { requirementKey: "accreditation-documents", status: "Approved" },
      { requirementKey: "financial-report", status: "Pending" },
      { requirementKey: "action-plan", status: "Pending" },
    ];
    for (const sub of submissionSeeds) {
      const existing = await models.RequirementSubmission.findOne({
        requirementKey: sub.requirementKey,
        organizationProfile: cssProfile._id,
      });
      if (!existing) {
        await models.RequirementSubmission.create({
          ...sub,
          organizationProfile: cssProfile._id,
          logs: [`Submitted on ${new Date().toLocaleDateString()}`],
          uploadedBy: createdUsers["student_leader1"]?._id,
        });
        log(`Created submission: ${sub.requirementKey} for CSS`);
      }
    }
  }

  // ── 13. ProposedActionPlans + Proposals + ProposalConduct ─────────────────
  section("ProposedActionPlan + Proposals + ProposalsConduct");
  const proposalSeedData = [
    {
      orgKey: "Computer Science Society",
      proposals: [
        {
          activityTitle: "Web Development Seminar",
          alignedSDG: [
            "SDG 4 - Quality Education",
            "SDG 9 - Industry, Innovation and Infrastructure",
          ],
          budgetaryRequirements: 3000,
          venue: "CCMS Lab 1",
          proposalType: "Activity",
          ProposalCategory: "Academic",
          briefDetails:
            "A seminar-workshop on modern web development technologies including React, Node.js, and MongoDB.",
          AlignedObjective:
            "To enhance the technical skills of CCMS students in web development.",
          proposedDate: new Date("2025-02-15"),
          overallStatus: "Approved",
          conduct: { overallStatus: "Approved" },
        },
        {
          activityTitle: "Intramural Sports Fest Participation",
          alignedSDG: ["SDG 3 - Good Health and Well-Being"],
          budgetaryRequirements: 1500,
          venue: "Gymnasium",
          proposalType: "Activity",
          ProposalCategory: "Sports",
          briefDetails:
            "Participation of CSS members in the annual CNSC Intramural Sports Festival.",
          AlignedObjective:
            "To promote physical wellness and sportsmanship among members.",
          proposedDate: new Date("2025-03-05"),
          overallStatus: "Pending",
        },
        {
          activityTitle: "Community Clean-Up Drive",
          alignedSDG: [
            "SDG 11 - Sustainable Cities and Communities",
            "SDG 13 - Climate Action",
          ],
          budgetaryRequirements: 500,
          venue: "Covered Court",
          proposalType: "Project",
          ProposalCategory: "Community Service",
          briefDetails:
            "A community outreach activity focused on environmental cleanliness within the campus vicinity.",
          AlignedObjective:
            "To cultivate civic responsibility and environmental stewardship among members.",
          proposedDate: new Date("2025-04-20"),
          overallStatus: "Pending",
        },
      ],
    },
    {
      orgKey: "Civil Engineering Society",
      proposals: [
        {
          activityTitle: "AutoCAD Training Workshop",
          alignedSDG: ["SDG 4 - Quality Education"],
          budgetaryRequirements: 2000,
          venue: "Engineering Lab",
          proposalType: "Activity",
          ProposalCategory: "Academic",
          briefDetails:
            "Hands-on training on AutoCAD software for civil engineering design and drafting.",
          AlignedObjective:
            "To equip CES members with industry-standard drafting skills.",
          proposedDate: new Date("2025-02-28"),
          overallStatus: "Pending",
        },
      ],
    },
  ];

  for (const orgPropData of proposalSeedData) {
    const { orgKey, proposals } = orgPropData;
    const profile = createdProfiles[orgKey];
    const org = createdOrgs[orgKey];
    if (!profile) continue;

    let actionPlan = await models.ProposedActionPlan.findOne({
      organizationProfile: profile._id,
    });
    if (actionPlan) continue;

    actionPlan = await models.ProposedActionPlan.create({
      organizationProfile: profile._id,
      organization: org._id,
      overallStatus: "Pending",
    });

    const proposalIds = [];
    for (const p of proposals) {
      const { conduct, ...proposalData } = p;
      const proposal = await models.Proposal.create({
        ...proposalData,
        organizationProfile: profile._id,
        organization: org._id,
        ProposedActionPlanSchema: actionPlan._id,
      });
      proposalIds.push(proposal._id);

      if (conduct) {
        await models.ProposalConduct.create({
          ProposedActionPlanSchema: actionPlan._id,
          ProposedIndividualActionPlan: {
            activityTitle: proposalData.activityTitle,
            alignedSDG: proposalData.alignedSDG,
            budgetaryRequirements: proposalData.budgetaryRequirements,
            venue: proposalData.venue,
            briefDetails: proposalData.briefDetails,
            AlignedObjective: proposalData.AlignedObjective,
            proposedDate: proposalData.proposedDate,
          },
          overallStatus: conduct.overallStatus,
          organizationProfile: profile._id,
          organization: org._id,
        });
      }
    }
    await models.ProposedActionPlan.findByIdAndUpdate(actionPlan._id, {
      $set: { ProposedIndividualActionPlan: proposalIds },
    });
    log(
      `Created action plan + ${proposalIds.length} proposal(s) for ${orgKey}`,
    );
  }

  // ── 14. Accomplishments + SubAccomplishments ───────────────────────────────
  section("Accomplishments + SubAccomplishment");
  const accomplishmentSeeds = [
    {
      orgKey: "Computer Science Society",
      academicYear: "2024-2025",
      overallStatus: "Pending",
      subs: [
        {
          category: "Program/Project/Activity",
          title: "Web Development Seminar",
          description:
            "Successfully conducted a 2-day seminar on React and Node.js with 45 participants.",
          date: new Date("2025-02-16"),
          overallStatus: "Approved",
          grading: {
            totalPoints: 85,
            maxPoints: 100,
            status: "Graded",
            gradedBy: "SDU Coordinator",
            gradedAt: new Date(),
            comments: "Well-organized event with good attendance.",
          },
          awardedPoints: 85,
        },
        {
          category: "Awards and Recognition",
          title: "Regional ICT Quiz Bee - 1st Place",
          description:
            "CSS member won 1st place at the Regional ICT Quiz Bee held in Naga City.",
          date: new Date("2024-11-20"),
          level: "Regional",
          overallStatus: "Approved",
          grading: {
            totalPoints: 95,
            maxPoints: 100,
            status: "Graded",
            gradedBy: "SDU Coordinator",
            gradedAt: new Date(),
            comments: "Outstanding achievement.",
          },
          awardedPoints: 95,
        },
        {
          category: "Community Service/Extension",
          title: "Free Tech Consultation for Barangay",
          description:
            "Provided free computer literacy and basic tech consultation to Barangay Lag-on residents.",
          date: new Date("2025-01-10"),
          overallStatus: "Pending",
          grading: { totalPoints: 0, maxPoints: 100, status: "Pending" },
          awardedPoints: 0,
        },
      ],
    },
  ];

  for (const acc of accomplishmentSeeds) {
    const { orgKey, subs, ...accData } = acc;
    const profile = createdProfiles[orgKey];
    const org = createdOrgs[orgKey];
    if (!profile) continue;
    let accomplishment = await models.Accomplishment.findOne({
      organizationProfile: profile._id,
    });
    if (accomplishment) continue;

    const subIds = [];
    let totalPoints = 0;
    for (const sub of subs) {
      const s = await models.SubAccomplishment.create({
        ...sub,
        organizationProfile: profile._id,
        organization: org._id,
      });
      subIds.push(s._id);
      totalPoints += sub.awardedPoints || 0;
    }
    await models.Accomplishment.create({
      ...accData,
      organizationProfile: profile._id,
      organization: org._id,
      accomplishments: subIds,
      grandTotal: totalPoints,
    });
    log(
      `Created accomplishment record for ${orgKey} with ${subs.length} sub-items`,
    );
  }

  // ── 15. Posts ─────────────────────────────────────────────────────────────
  section("Posts");
  const postSeeds = [
    {
      orgKey: "Computer Science Society",
      title: "CSS Web Dev Seminar Recap",
      caption:
        "Our Web Development Seminar was a huge success! Thank you to all participants and our resource speaker.",
      tags: ["seminar", "webdev", "CSS"],
      status: "Approved",
    },
    {
      orgKey: "Computer Science Society",
      title: "Call for Participants: Intramural Sports Fest",
      caption:
        "CSS is calling all members to join this year's CNSC Intramural Sports Festival. Sign up now!",
      tags: ["sports", "intramural", "CSS"],
      status: "Approved",
    },
    {
      orgKey: "Civil Engineering Society",
      title: "CES AutoCAD Workshop — Registration Open",
      caption:
        "Register now for our AutoCAD Training Workshop. Limited slots available!",
      tags: ["autocad", "workshop", "CES"],
      status: "Pending",
    },
  ];

  for (const p of postSeeds) {
    const { orgKey, ...postData } = p;
    const profile = createdProfiles[orgKey];
    if (!profile) continue;
    const existing = await models.Post.findOne({
      title: postData.title,
      organizationProfile: profile._id,
    });
    if (!existing) {
      await models.Post.create({
        ...postData,
        organizationProfile: profile._id,
      });
      log(`Created post: "${postData.title}"`);
    }
  }

  // ── 16. Notifications ─────────────────────────────────────────────────────
  section("Notifications");
  const notifSeeds = [
    {
      orgKey: "Computer Science Society",
      type: "accreditation",
      department: "College of Computing and Multimedia Studies",
      message: "Your organization's accreditation has been approved.",
      read: true,
    },
    {
      orgKey: "Computer Science Society",
      type: "proposal",
      department: "College of Computing and Multimedia Studies",
      message:
        "Web Development Seminar proposal has been approved by the adviser.",
      read: true,
    },
    {
      orgKey: "Computer Science Society",
      type: "proposal",
      department: "College of Computing and Multimedia Studies",
      message: "Intramural Sports Fest proposal is pending review.",
      read: false,
    },
    {
      orgKey: "Civil Engineering Society",
      type: "accreditation",
      department: "College of Engineering",
      message: "Your accreditation submission is under review by the SDU.",
      read: false,
    },
  ];

  for (const n of notifSeeds) {
    const { orgKey, ...notifData } = n;
    const profile = createdProfiles[orgKey];
    if (!profile) continue;
    const existing = await models.Notification.findOne({
      message: notifData.message,
      organizationProfile: profile._id,
    });
    if (!existing) {
      await models.Notification.create({
        ...notifData,
        organizationProfile: profile._id,
      });
      log(`Created notification: "${notifData.message.substring(0, 50)}..."`);
    }
  }

  // ── 17. AuditLogs ─────────────────────────────────────────────────────────
  section("AuditLog");
  const sduUser = createdUsers["sdu_admin"];
  const auditSeeds = [
    {
      action: "accreditation.approve",
      actorName: sduUser?.name,
      actorEmail: sduUser?.email,
      actorPosition: "sdu",
      targetType: "Accreditation",
      organizationName: "Computer Science Society",
      method: "PATCH",
      path: "/api/approveAccreditation",
      ip: "127.0.0.1",
      meta: { note: "All requirements completed and verified." },
    },
    {
      action: "proposal.update-status",
      actorName: createdAdvisers["adviser_ccms"]?.name,
      actorEmail: createdAdvisers["adviser_ccms"]?.email,
      actorPosition: "adviser",
      targetType: "ProposalsConduct",
      organizationName: "Computer Science Society",
      method: "PATCH",
      path: "/api/updateProposalStatus",
      ip: "127.0.0.1",
      meta: { newStatus: "Approved" },
    },
    {
      action: "organization.register",
      actorName: createdUsers["student_leader1"]?.name,
      actorEmail: createdUsers["student_leader1"]?.email,
      actorPosition: "student-leader",
      targetType: "OrganizationProfile",
      organizationName: "Computer Science Society",
      method: "POST",
      path: "/api/register",
      ip: "127.0.0.1",
      meta: { academicYear: "2024-2025" },
    },
  ];

  for (const al of auditSeeds) {
    await models.AuditLog.create({
      ...al,
      actorId: sduUser?._id,
      organizationProfile: cssProfile?._id,
      targetId: cssProfile?._id,
    });
  }
  log(`Created ${auditSeeds.length} audit log entries`);

  // ── 18. Logs ──────────────────────────────────────────────────────────────
  section("Logs");
  if (cssProfile) {
    const existing = await models.Logs.findOne({
      organizationProfile: cssProfile._id,
    });
    if (!existing) {
      await models.Logs.create({
        action: "Organization profile created for AY 2024-2025",
        organizationProfile: [cssProfile._id],
        Organization: createdOrgs["Computer Science Society"]._id,
      });
      log("Created Logs entry");
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("  SEED COMPLETE");
}

await mongoose.connect(process.env.MONGO_URI);

await seed();

seed().catch((err) => {
  console.error("\nSeed failed:", err);
  process.exit(1);
});
