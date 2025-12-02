import mongoose from "mongoose";
const { Schema } = mongoose;

// AccreditationRequirement tracks core template and custom accreditation requirements.
// Core templates (type='template') are non-removable and represent existing feature modules.
// Custom requirements (type='custom') are simple document uploads with title & description.
// Gating (enabled=false) will later hide related UI & block associated endpoints.

export const accreditationRequirementSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true }, // stable identifier (kebab-case)
    type: { type: String, enum: ["template", "custom"], required: true },
    title: { type: String, required: true }, // display name
    description: { type: String },
    enabled: { type: Boolean, default: true, index: true },
    removable: { type: Boolean, default: true }, // templates set false
    document: { type: Schema.Types.ObjectId, ref: "Documents" }, // custom requirement file
    version: { type: Number, default: 1 }, // increments on file replacement
    createdBy: { type: Schema.Types.ObjectId, ref: "Users" }, // actor for custom additions
    meta: { type: Schema.Types.Mixed }, // reserved for future (deadlines, cycle info, etc.)
  },
  { timestamps: true }
);

// Suggested stable template keys (seeded elsewhere):
// president-info, financial-report, roster, accreditation-documents, action-plan
