import mongoose, { Schema } from "mongoose";
import type { IUser } from "../type/types.ts";
import bcrypt from "bcrypt";
const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    searchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "SearchHistory",
      },
    ],
  },

  { timestamps: true },
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.matchPassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};
const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema, "users");
if (!mongoose.models["user"]) {
  mongoose.model("user", UserSchema, "users");
}
export default User;
