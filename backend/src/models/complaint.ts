import mongoose, { Schema, Document } from "mongoose";

export interface IComplaint extends Document {
  phoneNumber: string;
  issueType: string;
  imageUrl: string;
  severity: "low" | "medium" | "high";
  status: "pending" | "complete";
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

    imageUrl: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
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