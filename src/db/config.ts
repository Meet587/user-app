import mongoose from "mongoose";

if (!process.env.MONGO_URI) {
  throw new Error("Please add your MONGO_URI to .env");
}

const connectToDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri!);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

export default connectToDB;
