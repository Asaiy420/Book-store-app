import express from "express";
import User from "../models/user.models.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required in order to register" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be atleast 6 characters long" });
    }
    if (username < 3) {
      return res
        .status(400)
        .json({ message: "Usernaem should be at least 3 characters long" });
    }
    //?checking if a user or email already exist

    const exisitingEmail = await User.findOne({ $or: [{ email }] });
    if (exisitingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const existingUser = await User.findOne({ $or: [{ username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    //* Get a random profile avatar
    const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;

    const user = new User({
      email,
      username,
      password,
      profileImage,
    });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Error when creating the user", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });
    //?check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    //? check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

    //?Generate the token
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Error in login route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
