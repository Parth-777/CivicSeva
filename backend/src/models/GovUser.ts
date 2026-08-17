import mongoose, { Schema } from "mongoose";

// Separate from the citizen `User` model on purpose -- government login has
// completely different fields (username/password) and no OTP flow.
const GovUserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // "GOVADMIN" and "govadmin" are treated as the same account
    },
    password: {
      type: String,
      required: true, // bcrypt hash, never store plain text
    },
    name: {
      type: String,
      default: "Government Official",
    },
  },
  {
    timestamps: true,
  }
);

const GovUser =
  mongoose.models.GovUser || mongoose.model("GovUser", GovUserSchema);

export default GovUser;
