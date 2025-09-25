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
