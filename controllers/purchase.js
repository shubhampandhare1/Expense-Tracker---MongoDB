const Razorpay = require('razorpay');
const Purchase = require('../models/purchase');
const User = require('../models/user');

const userController = require('./user');

exports.purchasePremium = async (req, res, next) => {
    try {
        let rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        })
        const amount = 1000;
        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err));
            }
            try {
                const createOrder = new Purchase({
                    orderid: order.id,
                    status: 'PENDING',
                    userId: req.user
                })
                await createOrder.save();
                return res.status(201).json({ order: createOrder, key_id: rzp.key_id })
            }
            catch (err) {
                throw new Error(err);
            }
        })
    } catch (error) {
        console.log('err at purchasePremium controller>>>>', error);
        res.status(403).json({ message: 'Something went wrong', err: error });
    }
}

exports.updateTransactionStatus = async (req, res, next) => {
    const orderid = req.body.orderid;
    const paymentid = req.body.paymentid;

    if (paymentid != 'payment_failed') {
        try {
            const order = await Purchase.findOne({orderid: orderid})

            order.status = 'SUCCESSFUL';
            order.paymentid = paymentid;
            await order.save();

            await User.findByIdAndUpdate(req.user._id, { isPremium: true });

            return res.status(202).json({ success: true, message: 'Transaction Succesful', token: userController.generateAccessToken(req.user.id, true) })
        }
        catch (err) {
            console.log(err);
            res.status(403).json({ message: 'Payment Successful' });
        }
    }
    else {
        try {
            await Purchase.findOneAndUpdate({ orderid: orderid }, { paymentid: paymentid, status: 'Failed' });

            return res.status(202).json({ success: true, message: 'Transaction Failed' });
        }
        catch (err) {
            res.status(403).json({ message: 'Payment Failed' });
        }
    }
}