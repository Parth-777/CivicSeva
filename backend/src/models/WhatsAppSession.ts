import mongoose, { Schema, Document } from "mongoose";

export interface IWhatsAppSession extends Document {
  phoneNumber: string;
  issueType: string;
  description?: string;
  imageUrl?: string;
  address?: string;
  step: "DESCRIPTION" | "IMAGE" | "LOCATION" | "PROCESSING" | "COMPLETED";
  createdAt: Date;
}

const WhatsAppSessionSchema = new Schema<IWhatsAppSession>(
  {
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },

    issueType: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    imageUrl: {
      type: String,
    },

    address: {
      type: String,
    },

    step: {
      type: String,
      enum: [
        "DESCRIPTION",
        "IMAGE",
        "LOCATION",
        "PROCESSING",
        "COMPLETED",
      ],
      default: "DESCRIPTION",
    },
  },
  {
    timestamps: true,
  }
);

WhatsAppSessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }
);

export default mongoose.models.WhatsAppSession ||
  mongoose.model<IWhatsAppSession>(
    "WhatsAppSession",
    WhatsAppSessionSchema
  );