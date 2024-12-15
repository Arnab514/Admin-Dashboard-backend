import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { connectDB } from "./db/connectDB.js";

// Import routes
import authRoutes from './routes/authRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:3000', 'https://yourfrontenddomain.com'];

app.use(
    cors({
        origin: (origin, callback) => {
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    })
);

app.options('*', cors()); // Allow preflight requests for all routes

app.use(express.json());
app.use(cookieParser());

// Route Middleware
app.use('/api/auth', authRoutes);   // Auth routes (Login, Logout)
app.use('/api/stores', storeRoutes); // Store-related routes
app.use('/api/admin', adminRoutes); // Order-related routes

// Start server
app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port:", PORT);
});
