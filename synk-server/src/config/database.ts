import mongoose from "mongoose";
const connectDB = async () => {
  const mongourl = process.env.MONGO_URI!;
  if (!mongourl) {
    console.log("Mongo URI not found");
  }
  await mongoose.connect(mongourl);
  console.log("Connection with DB established");
};

export default connectDB;
