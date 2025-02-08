import express from 'express';
import { placeOrder, placeOrderStripe, verifyStripe, placeOrderRazorPay, allOrders, userOrders, updateStatus, verifyRazorPay } from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);

orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.post('/razorpay', authUser, placeOrderRazorPay);
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.post('/verifyStripe', authUser, verifyStripe);
orderRouter.post('/verifyRazorPay', authUser, verifyRazorPay);

export default orderRouter