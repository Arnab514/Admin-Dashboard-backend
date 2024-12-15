import express from 'express';
import { 
    createStore, 
    getStoresWithOrderDetails, 
    editStore, 
    deleteStore 
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Router } from 'express';

const router = Router();

// Route to create a store
router.post('/stores', authenticate, authorize('admin'), createStore);

// Route to get stores with order details
router.get('/serve', authenticate, authorize('admin'), getStoresWithOrderDetails);

router.put('/store/:username', authenticate, authorize('admin'), editStore);
router.delete('/store/:username', authenticate, authorize('admin'), deleteStore);

export default router;
