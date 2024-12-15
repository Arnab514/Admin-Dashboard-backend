import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    items: [{ name: String, quantity: Number, price: Number }],
    aggregator: { type: String, enum: ['Zomato', 'Swiggy', 'Uber Eats', 'DoorDash', 'Deliveroo'], required: true },
    netAmount: { type: Number, required: true },
    grossAmount: { type: Number, required: true },
    tax: { type: Number, required: true },
    discounts: { type: Number, required: true },
    eventLog: {
        type: [Object], // Array of objects
        default: [],
    }
},{ timestamps: true });

// module.exports = mongoose.model('Order', orderSchema);
export default mongoose.model('Order', orderSchema);

