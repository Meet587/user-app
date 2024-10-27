import mongoose from "mongoose";

if (!process.env.MONGO_URI) {
  throw new Error("Please add your MONGO_URI to .env");
}

let isConnected: boolean = false;

const connectToDB = async () => {
  if (isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }

  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri!);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

export default connectToDB;
