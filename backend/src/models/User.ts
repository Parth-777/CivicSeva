import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },

    address: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);

export default User;