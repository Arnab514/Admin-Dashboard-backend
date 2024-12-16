import mongoose from'mongoose';

const storeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    aggregators: [{ type: String, enum: ['Zomato', 'Swiggy', 'Uber Eats', 'DoorDash', 'Deliveroo'] }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'store' },  // Make sure the role is set

        // New fields for latest created order
    latestCreatedOrderTime: { type: Date, default: null },
    latestCreatedOrderElapsedTime: { type: String, default: 'N/A' }
});

// module.exports = mongoose.model('Store', storeSchema);
// export default mongoose.model('Store', storeSchema);
const Store = mongoose.model('Store', storeSchema);
export default Store;
