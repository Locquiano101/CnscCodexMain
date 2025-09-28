import mongoose from "mongoose";
const { Schema } = mongoose;
// ----------------- User Schema -----------------
export const userSchema = new Schema(
  {
    name: String,
    email: String,
    username: String,
    deliveryUnit: String,
    password: { type: String, minlength: 6 },
    position: String,

    organizationProfile: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
    },
    firstLogin: { type: Boolean, default: true }, // fixed here ✅

    Organization: {
      type: Schema.Types.ObjectId,
      ref: "Organizations",
    },
  },
  { timestamps: true }
);

export const AdviserSchema = new Schema(
  {
    name: String,
    email: String,
    username: String,
    deliveryUnit: String,
    firstLogin: { type: Boolean, default: true }, // fixed here ✅

    organizationProfile: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrganizationProfile",
      },
    ],

    Organization: {
      type: Schema.Types.ObjectId,
      ref: "Organizations",
    },
  },
  { timestamps: true }
);

export const LogsSchema = new Schema(
  {
    action: String,
    organizationProfile: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrganizationProfile",
      },
    ],

    Organization: {
      type: Schema.Types.ObjectId,
      ref: "Organizations",
    },
  },
  { timestamps: true }
);
export const DeadlineSchema = new Schema(
  {
    DeadlineFor: String, // accomplishment, proposal, etc.
    DeadlineDate: Date,
    isDeadlineActive: Boolean,
  },
  { timestamps: true }
);
