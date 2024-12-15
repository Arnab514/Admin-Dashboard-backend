import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/generateToken.js';

// Login controller
export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Use the generateToken utility to create the token
        const token = generateToken(user);

        // Return token, role, and the correct redirect path based on the user's role
        if (user.role === 'admin') {
            return res.status(200).json({ token, role: user.role, redirectTo: '/admin' });
        } else if (user.role === 'store') {
            return res.status(200).json({ token, role: user.role, redirectTo: '/store' });
        }

        // If the role is not recognized
        return res.status(401).json({ message: 'Unauthorized' });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Logout controller
export const logout = (req, res) => {
    try {
        // Since JWT is stateless, there's nothing to delete server-side.
        // But you can clear the token on the client-side.
        
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during logout' });
    }
};
