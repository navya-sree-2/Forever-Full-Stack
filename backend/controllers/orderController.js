import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import Razorpay from "razorpay";

//global variables
const currency = 'usd';
const deliveryCharge = 10;

// gateway initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// Placing order using COD
const placeOrder = async (req, res) => {
    try {
        const { userId, items, address, amount } = req.body;
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }
        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed" });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Placing order using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, address, amount } = req.body;
        const { origin } = req.headers;
        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));
        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: "payment",
        });

        res.json({ success: true, session_url: session.url });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Verify Stripe Payment
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;
    try {
        if (success) {
            await orderModel.findByIdAndUpdate(orderId, {
                payment: true
            });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true });
        }
        else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Placing  order using RazorPay Method
const placeOrderRazorPay = async (req, res) => {
    try {
        const { userId, items, address, amount } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "RazorPay",
            payment: false,
            date: Date.now()
        }
        const newOrder = await orderModel.create(orderData);
        await newOrder.save();

        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: newOrder._id.toString()
        }
        await razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                res.json({ success: false, message: error.message });
            }
            else {
                res.json({ success: true, order });
            }
        })
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const verifyRazorPay = async (req, res) => {
    try {
        const { userId, razorpay_order_id } = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if (orderInfo.status === 'paid') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt, {
                payment: true
            })
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true });
        }
        else {
            // await orderModel.findByIdAndDelete(orderInfo.receipt);
            res.json({ success: false, message: "Payment Failed" });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// All Orders data for Admin Panel 
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// User Order Data for FrontEnd
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// update order status from admin panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Status Updated" });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { placeOrder, placeOrderStripe, verifyStripe, placeOrderRazorPay, verifyRazorPay, allOrders, userOrders, updateStatus }