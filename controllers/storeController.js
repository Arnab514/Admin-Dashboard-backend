import Order from '../models/Order.js';
import Store from '../models/Store.js';
import { generateToken } from '../utils/generateToken.js'; 




// export const updateStoreLatestOrderInfo = async (storeId) => {
//     try {
//         // Find the latest created order for this store
//         const latestCreatedOrder = await Order.findOne({
//             store: storeId,
//             'eventLog.status': 'created'
//         })
//         .sort({ 'eventLog.timestamp': -1 })
//         .limit(1);

//         if (latestCreatedOrder) {
//             // Find the 'created' log entry
//             const createdLog = latestCreatedOrder.eventLog.find(
//                 (log) => log.status === 'created'
//             );

//             if (createdLog) {
//                 const lastCreatedTime = createdLog.timestamp;
//                 const createdElapsedTime = Math.abs(new Date() - new Date(lastCreatedTime)) / (1000 * 60 * 60);

//                 // Update the store with latest order information
//                 await Store.findByIdAndUpdate(storeId, {
//                     latestCreatedOrderTime: new Date(lastCreatedTime),
//                     latestCreatedOrderElapsedTime: `${createdElapsedTime.toFixed(2)} hours`
//                 });
//             }
//         }
//     } catch (error) {
//         console.error('Error updating store latest order info:', error);
//     }
// };

export const updateStoreLatestOrderInfo = async (storeId) => {
    try {
        // Find the latest created order for this store
        const latestCreatedOrder = await Order.findOne({
            store: storeId,
            'eventLog.status': 'created'
        })
        .sort({ 'eventLog.timestamp': -1 })
        .limit(1);

        if (latestCreatedOrder) {
            // Find the 'created' log entry
            const createdLog = latestCreatedOrder.eventLog.find(
                (log) => log.status === 'created'
            );

            if (createdLog) {
                const lastCreatedTime = createdLog.timestamp;
                const createdDate = new Date(lastCreatedTime);
                const createdElapsedTime = Math.abs(new Date() - createdDate) / (1000 * 60 * 60);

                // If less than an hour, show in minutes
                const elapsedTimeString = createdElapsedTime < 1 
                                ? `${(createdElapsedTime * 60).toFixed(2)} minutes` 
                                : `${createdElapsedTime.toFixed(2)} hours`;

                // Format the date to match "Dec 16, 2024, 02:27 PM" style
                const formattedCreatedTime = createdDate.toLocaleString('en-US', {
                    month: 'numeric',
                    day: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    // hour12: true
                });

                // Update the store with latest order information
                await Store.findByIdAndUpdate(storeId, {
                    latestCreatedOrderTime: formattedCreatedTime,
                    latestCreatedOrderElapsedTime: elapsedTimeString
                    // latestCreatedOrderElapsedTime: `${createdElapsedTime.toFixed(2)} hours`
                }, { 
                    // This option ensures we get the updated document back
                    new: true 
                });

                // Optionally, you can log the formatted time for verification
                console.log('Formatted Created Time:', formattedCreatedTime);
            }
        }
    } catch (error) {
        console.error('Error updating store latest order info:', error);
    }
};


export const createOrder = async (req, res) => {
    const { items, aggregator, netAmount, grossAmount, tax, discounts } = req.body;

    try {
        const storeId = req.store._id;
        const order = new Order({
            store: storeId,
            items,
            aggregator,
            netAmount,
            grossAmount,
            tax,
            discounts,
            eventLog: [
                {
                    status: 'created',
                    timestamp: new Date(),
                },
            ],
        });

        await order.save();
        res.status(201).json({ message: 'Order created successfully', order });

        await updateStoreLatestOrderInfo(order.store)
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
};


export const markOrderAsDelivered = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.eventLog.push({
            status: 'delivered',
            timestamp: new Date(),
        });

        await order.save();
        res.status(200).json({ message: 'Order marked as delivered', order });
    } catch (error) {
        res.status(500).json({ message: 'Error marking order as delivered', error: error.message });
    }
};




export const getStoreOrders = async (req, res) => {
    try {
        // Use the authenticated store's ID from req.store
        const storeId = req.store._id;

        // Fetch all orders for the authenticated store
        const orders = await Order.find({ store: storeId });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};


export const getStoreAggregators = async (req, res) => {
    try {
        // Get the authenticated store's ID from req.store
        const storeId = req.store._id;
        
        // Fetch the store with its aggregators
        const store = await Store.findById(storeId);
        
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        
        // Return the store's aggregators
        res.status(200).json({ aggregators: store.aggregators });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching store aggregators', error: error.message });
    }
};