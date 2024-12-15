import Order from '../models/Order.js';
import Store from '../models/Store.js';
import { generateToken } from '../utils/generateToken.js'; 

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