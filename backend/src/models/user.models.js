import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      requried: true,
      unique: true,
      trim: true,
      index: true,
      minLength: 3,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password field cannot be left empty"],
      minLength: 6,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

//! Hashing the user's password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});
//?comparing passwords function

userSchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
