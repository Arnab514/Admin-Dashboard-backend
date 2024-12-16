import Store from '../models/Store.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import mongoose from 'mongoose';

// Create Store (Existing Code)
export const createStore = async (req, res) => {
    const { name, username, password, aggregators } = req.body;
    try {
        // Check if the store username already exists in the User collection
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create a new store
        const store = new Store({ 
            name, 
            username, 
            password, 
            aggregators, 
            createdBy: req.user.id,
            role: 'store' // Explicitly set the role here
        });

        // Save the store to the Store collection
        await store.save();

        // Create a corresponding user for the store with the 'store' role
        const storeUser = new User({
            _id: store._id, // Use the same _id as the store
            username, // Store's username
            password, // Store's password
            role: 'store' // Role is 'store' for the store user
        });

        // Save the user to the User collection
        await storeUser.save();

        // Generate token for the new store
        const token = generateToken(store);

        res.status(201).json({ 
            message: 'Store and user created successfully',
            token, // Send the token back to the client
            store: {
                id: store._id,
                name: store.name,
                username: store.username
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating store and user', error: error.message });
    }
};

// Get Stores with Order Details (Existing Code)
// export const getStoresWithOrderDetails = async (req, res) => {
//     try {
//         const stores = await Store.find();

//         const storeDetails = await Promise.all(
//             stores.map(async (store) => {
//                 // Fetch the latest delivered order for the store
//                 const latestDeliveredOrder = await Order.findOne({
//                     store: store._id,
//                     'eventLog.status': 'delivered',
//                 })
//                     .sort({ 'eventLog.timestamp': -1 })
//                     .limit(1);

//                 // Fetch the latest created order for the store
//                 const latestCreatedOrder = await Order.findOne({
//                     store: store._id,
//                     'eventLog.status': 'created',
//                 })
//                     .sort({ 'eventLog.timestamp': -1 })
//                     .limit(1);

//                 // Default details if no orders exist
//                 let deliveredDetails = {
//                     lastDeliveredTime: 'No delivered orders',
//                     deliveredElapsedTime: 'N/A'
//                 };

//                 let createdDetails = {
//                     lastCreatedTime: 'No orders created',
//                     createdElapsedTime: 'N/A'
//                 };

//                 // Calculate delivered order times if exists
//                 if (latestDeliveredOrder) {
//                     const lastDeliveredLog = latestDeliveredOrder.eventLog.find(
//                         (log) => log.status === 'delivered'
//                     );

//                     if (lastDeliveredLog) {
//                         const lastDeliveredTime = lastDeliveredLog.timestamp;
//                         const deliveredElapsedTime = Math.abs(new Date() - new Date(lastDeliveredTime)) / (1000 * 60 * 60);

//                         deliveredDetails = {
//                             lastDeliveredTime: new Date(lastDeliveredTime).toLocaleString(),
//                             deliveredElapsedTime: `${deliveredElapsedTime.toFixed(2)} hours`
//                         };
//                     }
//                 }

//                 // Calculate created order times if exists
//                 if (latestCreatedOrder) {
//                     const lastCreatedLog = latestCreatedOrder.eventLog.find(
//                         (log) => log.status === 'created'
//                     );

//                     if (lastCreatedLog) {
//                         const lastCreatedTime = lastCreatedLog.timestamp;
//                         const createdElapsedTime = Math.abs(new Date() - new Date(lastCreatedTime)) / (1000 * 60 * 60);

//                         createdDetails = {
//                             lastCreatedTime: new Date(lastCreatedTime).toLocaleString(),
//                             createdElapsedTime: `${createdElapsedTime.toFixed(2)} hours`
//                         };
//                     }
//                 }

//                 return {
//                     storeName: store.name,
//                     username: store.username,
//                     aggregators: store.aggregators,
//                     lastDeliveredTime: deliveredDetails.lastDeliveredTime,
//                     elapsedTime: deliveredDetails.deliveredElapsedTime,
//                     lastCreatedTime: createdDetails.lastCreatedTime,
//                     createdElapsedTime: createdDetails.createdElapsedTime
//                 };
//             })
//         );

//         res.status(200).json(storeDetails);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching store details', error: error.message });
//     }
// };


export const getStoresWithOrderDetails = async (req, res) => {
    try {
        const stores = await Store.find();

        const storeDetails = stores.map(store => ({
            storeName: store.name,
            username: store.username,
            aggregators: store.aggregators,
            lastCreatedTime: store.latestCreatedOrderTime 
                ? new Date(store.latestCreatedOrderTime).toLocaleString() 
                : 'No orders created',
            createdElapsedTime: store.latestCreatedOrderElapsedTime || 'N/A'
        }));

        res.status(200).json(storeDetails);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching store details', error: error.message });
    }
};

// Get Individual Store by Username or ID
export const getStore = async (req, res) => {
    try {
        const { identifier } = req.params;

        // Check if the identifier is a valid MongoDB ObjectId
        const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

        let store;
        if (isObjectId) {
            // Search by ID
            store = await Store.findById(identifier).select('-password');
        } else {
            // Search by username
            store = await Store.findOne({ username: identifier }).select('-password');
        }

        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Optional: Fetch additional store details like order count
        const orderCount = await Order.countDocuments({ store: store._id });

        res.status(200).json({
            store: {
                id: store._id,
                name: store.name,
                username: store.username,
                aggregators: store.aggregators,
                totalOrders: orderCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching store details', error: error.message });
    }
};

// Edit Store Details
export const editStore = async (req, res) => {
    const { username } = req.params; // Get username from URL params
    const { name, password, aggregators } = req.body; // New details to update

    try {
        // Find the store by username
        const store = await Store.findOne({ username });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Update the store details
        if (name) store.name = name;
        if (password) store.password = password;
        if (aggregators) store.aggregators = aggregators;

        // Save the updated store
        await store.save();

        // Update corresponding User credentials if password is updated
        if (password) {
            const storeUser = await User.findOne({ username });
            if (storeUser) {
                storeUser.password = password;
                await storeUser.save();
            }
        }

        res.status(200).json({
            message: 'Store updated successfully',
            store: {
                id: store._id,
                name: store.name,
                username: store.username,
                aggregators: store.aggregators,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating store', error: error.message });
    }
};


// Delete Store
export const deleteStore = async (req, res) => {
    const { username } = req.params; // Get username from URL params

    try {
        // Find and delete the store by username
        const store = await Store.findOneAndDelete({ username });
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Also delete the corresponding user
        await User.findOneAndDelete({ username });

        res.status(200).json({ message: 'Store and corresponding user deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting store', error: error.message });
    }
};
