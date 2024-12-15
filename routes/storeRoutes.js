// import express from 'express';
// import { getStoreOrders, createOrder } from '../controllers/storeController.js';
// import { authenticate, authorize } from '../middleware/authMiddleware.js';
// const router = express.Router();

// router.get('/orders', authenticate, authorize('store'), getStoreOrders);
// router.post('/orders', authenticate, authorize('store'), createOrder);

// export default router;




import express from 'express';
import { authenticate, storeAuthenticate  } from '../middleware/authMiddleware.js';
import { createOrder, getStoreOrders, getStoreAggregators } from '../controllers/storeController.js';

const router = express.Router();

// Store-specific routes (requires store authentication)
router.post('/orders', storeAuthenticate, createOrder); // Creating orders for a specific store
router.get('/orders', storeAuthenticate, getStoreOrders); // Fetching orders for a specific store
router.get('/aggregators', storeAuthenticate, getStoreAggregators);

export default router;
