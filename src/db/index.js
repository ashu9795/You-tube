import mongoose from 'mongoose';
import DB_NAME from "../constants.js";

const connectDB = async () => {
    try {
        // Await the connection
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        // Access the connection details
        console.log(`\n MongoDB connected!! DB HOST: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MongoDB connection failed", error);
        process.exit(1);
    }
};

export default connectDB;
