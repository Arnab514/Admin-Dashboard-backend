// import cookieParser from "cookie-parser";
// import cors from "cors";
// import dotenv from "dotenv";
// import express from "express";
// import mongoose from "mongoose";
// import { connectDB } from "./db/connectDB.js";

// // Import routes
// import authRoutes from './routes/authRoutes.js';
// import storeRoutes from './routes/storeRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT

// const allowedOrigins = ['http://localhost:3000', 'https://yourfrontenddomain.com'];

// app.use(
//     cors({
//         origin: (origin, callback) => {
//             if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//                 callback(null, true);
//             } else {
//                 callback(new Error('Not allowed by CORS'));
//             }
//         },
//         credentials: true,
//     })
// );

// app.options('*', cors()); // Allow preflight requests for all routes

// app.use(express.json());
// app.use(cookieParser());

// // Route Middleware
// app.use('/api/auth', authRoutes);   // Auth routes (Login, Logout)
// app.use('/api/stores', storeRoutes); // Store-related routes
// app.use('/api/admin', adminRoutes); // Order-related routes

// // Start server
// app.listen(PORT, () => {
//     connectDB();
//     console.log("Server is running on port:", PORT);
// });


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

const allowedOrigins = [
    'http://localhost:3000', 
    'https://admin-store-frontend.vercel.app',
    'https://admin-store-frontend-38u6nzz3t-arnab-majumders-projects.vercel.app',
    'https://admin-store-frontend-git-main-arnab-majumders-projects.vercel.app',
    // Add your deployed frontend URL here
];

// Improved CORS configuration
app.use(
    cors({
        origin: (origin, callback) => {
            console.log('Received origin:', origin); // Log the received origin
            if (!origin || allowedOrigins.includes(origin)) {
                console.log('Origin allowed:', origin); // Log allowed origins
                callback(null, true);
            } else {
                console.log('Origin rejected:', origin); // Log rejected origins
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

app.options('*', cors()); // Handle preflight requests

// Increase payload limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Route Middleware
app.use('/api/auth', authRoutes);   // Auth routes (Login, Logout)
app.use('/api/stores', storeRoutes); // Store-related routes
app.use('/api/admin', adminRoutes); // Order-related routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString() 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

// Graceful shutdown
const server = app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    server.close(() => process.exit(1));
});

export default app;