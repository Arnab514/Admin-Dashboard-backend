import jwt from 'jsonwebtoken';

// Utility function to generate a token for stores
export const generateToken = (store) => {
    console.log(store);  // Debugging: log the store object
    return jwt.sign(
        { storeId: store._id, username: store.username, role: store.role },  // Correctly use store._id
        process.env.JWT_SECRET,  // Your secret key
        { expiresIn: '1h' }  // Token expires in 1 hour
    );
};

