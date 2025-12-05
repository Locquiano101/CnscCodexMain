import mongoose from "mongoose";
const { Schema } = mongoose;

export const ReceiptSchema = new mongoose.Schema(
  {
    organizationProfile: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile", // ✅ exact match
    },
    description: String,
    amount: Number,
    expenseType: String,
    document: {
      type: Schema.Types.ObjectId,
      ref: "Documents", // ✅ matches your model registration
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const collectibleFeeSchema = new mongoose.Schema({
  organizationProfile: {
    type: Schema.Types.ObjectId,
    ref: "OrganizationProfile", // ✅ exact match
  },
  amount: Number,
  title: String,
  description: String,
  isCollected: { type: Boolean, default: false },
  status: {
    type: String,
    default: "UNCHECKED",
  },
});

export const cashInflowSchema = new mongoose.Schema({
  organizationProfile: {
    type: Schema.Types.ObjectId,
    ref: "OrganizationProfile", // ✅ exact match
  },
  collectibleFee: {
    type: Schema.Types.ObjectId,
    ref: "CollectibleFee",
  },
  paidRosterMembers: Number,
  amount: Number,
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    default: "UNCHECKED",
  },
});

export const financialReportSchema = new mongoose.Schema(
  {
    organizationProfile: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      require: true,
    },

    accreditation: {
      type: Schema.Types.ObjectId,
      ref: "accreditations",
    },

    initialBalance: Number,
    endingBalance: Number,
    isActive: Boolean,

    collections: [
      {
        type: Schema.Types.ObjectId,
        ref: "Receipts",
      },
    ],

    collectibleFees: [
      {
        type: Schema.Types.ObjectId,
        ref: "CollectibleFee",
      },
    ],

    cashInflows: [
      {
        type: Schema.Types.ObjectId,
        ref: "CashInflow",
      },
    ],
    cashoutflows: [
      {
        type: Schema.Types.ObjectId,
        ref: "Receipts",
      },
    ],

    reimbursements: [
      {
        type: Schema.Types.ObjectId,
        ref: "Receipts",
      },
    ],
    disbursements: [
      {
        type: Schema.Types.ObjectId,
        ref: "Receipts",
      },
    ],
  },
  { timestamps: true }
);
