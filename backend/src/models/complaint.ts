import mongoose, { Schema, Document } from "mongoose";

export interface IComplaint extends Document {
  phoneNumber: string;
  issueType: string;
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  imageUrl: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "complete";
  department?: string;
  problem?: string;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    phoneNumber: {
      type: String,
      required: true,
    },

    issueType: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    latitude: {
      type: Number,
      required: false,
    },

    longitude: {
      type: Number,
      required: false,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: false,
    },

    department: {
      type: String,
      required: false,
    },

    problem: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      enum: ["pending", "complete"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Complaint ||
  mongoose.model<IComplaint>("Complaint", ComplaintSchema);
