import jwt from 'jsonwebtoken';
import Store from '../models/Store.js'; // Assuming Store model contains store credentials
import User from '../models/User.js';
import { ObjectId } from 'mongodb'; // Add this import

export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        console.log('Decoded user:', user); // Debug log
        req.user = user; // Admin or general user information
        next();
    });
};

// export const storeAuthenticate = async (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     console.log('Authorization Header:', authHeader);

//     if (!authHeader) {
//         return res.status(401).json({ message: 'No Authorization header' });
//     }

//     const tokenParts = authHeader.split(' ');
//     if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
//         return res.status(401).json({ message: 'Invalid Authorization header format' });
//     }

//     const token = tokenParts[1];

//     try {
//         // Decode the token
//         const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//         console.log('Decoded Token Details:', decodedToken);

//         // Validate storeId
//         const storeId = decodedToken.storeId;
//         console.log('Store ID from Token:', storeId);

//         if (!storeId) {
//             return res.status(401).json({ message: 'Invalid token' });
//         }

//         // Ensure storeId is a valid ObjectId
//         if (!ObjectId.isValid(storeId)) {
//             return res.status(400).json({ message: 'Invalid store ID format' });
//         }

//         // First, try to find the store in the Store model
//         let store = await Store.findById(new ObjectId(storeId));
//         console.log('Store in Store Model:', store);

//         // If not found in Store model, try to find in User model
//         if (!store) {
//             const user = await User.findById(new ObjectId(storeId));
//             console.log('User Found:', user);

//             if (!user || user.role !== 'store') {
//                 return res.status(404).json({ 
//                     message: 'Store not found',
//                     details: `No store exists with ID: ${storeId}` 
//                 });
//             }

//             // If user is found, create a store-like object
//             store = {
//                 _id: user._id,
//                 username: user.username,
//                 role: user.role
//             };
//         }

//         req.store = store;
//         next();
//     } catch (err) {
//         console.error('Full Authentication Error:', err);

//         if (err.name === 'JsonWebTokenError') {
//             return res.status(401).json({ 
//                 message: 'Invalid token',
//                 details: err.message 
//             });
//         }

//         if (err.name === 'TokenExpiredError') {
//             return res.status(401).json({ 
//                 message: 'Token expired',
//                 details: 'Please log in again' 
//             });
//         }

//         return res.status(500).json({ 
//             message: 'Authentication error',
//             details: err.message 
//         });
//     }
// };

export const storeAuthenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const { username } = req.params; // Extract username from params

    console.log('Authentication Debug:', {
        authHeader,
        requestUsername: username,
        fullParams: req.params
    });

    if (!authHeader) {
        return res.status(401).json({ message: 'No Authorization header' });
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid Authorization header format' });
    }

    const token = tokenParts[1];

    try {
        // Decode the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token Details:', {
            storeId: decodedToken.storeId,
            username: decodedToken.username,
            role: decodedToken.role
        });

        // Find the store, allowing more flexible matching
        let store = await Store.findOne({ 
            $or: [
                { _id: decodedToken.storeId },
                { username: decodedToken.username }
            ]
        });

        // If no store found, check user model
        if (!store) {
            const user = await User.findOne({
                $or: [
                    { _id: decodedToken.storeId },
                    { username: decodedToken.username }
                ]
            });

            if (!user || user.role !== 'store') {
                return res.status(404).json({ 
                    message: 'Store not found',
                    details: `No store exists for token details`,
                    tokenDetails: decodedToken
                });
            }

            store = {
                _id: user._id,
                username: user.username,
                role: user.role
            };
        }

        // Additional username verification
        if (username && store.username !== username) {
            return res.status(403).json({ 
                message: 'Username mismatch',
                tokenUsername: store.username,
                requestUsername: username
            });
        }

        req.store = store;
        req.user = { ...store, role: 'store' }; // Ensure user object is set for subsequent middleware
        next();
    } catch (err) {
        console.error('Full Authentication Error:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });

        // Detailed error responses
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Invalid token',
                details: err.message 
            });
        }

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired',
                details: 'Please log in again' 
            });
        }

        return res.status(500).json({ 
            message: 'Authentication error',
            details: err.message 
        });
    }
};


// Role-based authorization (for admin-specific routes)
export const authorize = (role) => (req, res, next) => {
    console.log('User role:', req.user.role); // Debug log
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
};
