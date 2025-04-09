import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

const protectRoute = async (req, res, next) => {
  try {
    //get the token
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token)
      return res
        .status(401)
        .json({ message: "No authentication token access denied!" });

    //verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //find the user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "Token is not valid!" });

    req.user = user;
    next();
  } catch (error) {
    // if token not valid send error message
    console.error("Authentication error:", error.message);
    res.status(401).json({ message: "Token is not valid!!" });
  }
};

export default protectRoute;
