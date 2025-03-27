import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Database has been connected`);
  } catch (error) {
    console.log("Error connecting to the database: ", error);
    process.exit(1);
  }
};
