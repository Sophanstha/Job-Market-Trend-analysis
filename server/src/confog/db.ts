import mongoose from "mongoose";

const connectDb = async (): Promise<typeof mongoose> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error(
      "MONGO_URI environment variable is missing. Please define MONGO_URI in your environment or server/.env."
    );
  }

  try {
    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${(error as Error).message}`);
    throw error;
  }
};

export default connectDb;