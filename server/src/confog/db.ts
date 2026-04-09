import mongoose from "mongoose";

const connectDb = async() :Promise<void>=>{
    try {
        const connect = 
        await mongoose.connect(process.env.MONGO_URI as string)
        console.log(`MongoDB Connected : ${connect.connection.host}`)
    } catch (error) {
    console.error(`MongoDB Error: ${(error as Error).message}`);
    process.exit(1);
    }
}
export default connectDb