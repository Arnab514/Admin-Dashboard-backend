// import mongoose from "mongoose";

// export const connectDB = async () => {
// 	try {
// 		console.log("mongo_uri: ", process.env.MONGO_URI);
// 		const conn = await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// 		console.log(`MongoDB Connected: ${conn.connection.host}`);
// 	} catch (error) {
// 		console.log("Error connection to MongoDB: ", error.message);
// 		process.exit(1); // 1 is failure, 0 status code is success
// 	}
// };


import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // Log the URI (but be careful not to log sensitive parts in production)
        console.log("Attempting to connect to MongoDB");

        // Remove deprecated options
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        
        // Additional detailed logging
        console.error("MongoDB URI verification:", {
            uriProvided: !!process.env.MONGO_URI,
            uriLength: process.env.MONGO_URI?.length || 0
        });

        process.exit(1);
    }
};