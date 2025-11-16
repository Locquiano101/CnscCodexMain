import mongoose from "mongoose";
const { Schema } = mongoose;

export const roomLocationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    building: { type: String, trim: true },
    campus: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["room", "hall", "lab", "outdoor", "other"],
      default: "room",
    },
    capacity: { type: Number, min: 0 },
    active: { type: Boolean, default: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

roomLocationSchema.index({ campus: 1, name: 1 }, { unique: true });
roomLocationSchema.index({ active: 1, campus: 1 });

export const RoomLocation = mongoose.model("RoomLocation", roomLocationSchema);
