import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js'; // Adjust the import path as needed

dotenv.config(); // Make sure .env file is loaded

const createAdminUser = async () => {
    try {
        // Ensure the MongoDB URI is loaded from the .env file
        console.log('MONGO_URI:', process.env.MONGO_URI);
        
        // Connect to MongoDB (ensure you have the correct DB URI in .env)
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        // Check if an admin user already exists
        const existingAdmin = await User.findOne({ username: 'admin@gmail.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create a new admin user
        const admin = new User({
            username: 'admin@gmail.com',
            password: 'password', // Use the password you want
            role: 'admin'
        });

        // Save the admin user to the database
        await admin.save();
        console.log('Admin user created successfully');

        // Close the connection
        mongoose.connection.close();
    } catch (error) {
        console.error('Error creating admin user:', error);
        mongoose.connection.close();
    }
};

createAdminUser();
