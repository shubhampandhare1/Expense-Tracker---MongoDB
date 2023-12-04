const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ Error: 'All fields are required' })
        }

        const userExist = await User.findOne({ email: email })

        if (userExist) {
            return res.status(409).json({ error: 'User Already Exists' });
        }
        const saltrounds = 10;
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            if (err) {
                console.log('error at bcrypt.hash', err);
            }
            const newUser = new User({
                name: name,
                email: email,
                password: hash,
            });
            await newUser.save();
            res.status(201).json({ success: true, message: 'Account Created Successfully' });
        })
    }
    catch (err) {
        res.status(500).json({ err })
    }
}

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const userExist = await User.findOne({
            email: email
        })

        if(!userExist){
            res.status(404).json({message:"User Not Found"})
        }

        bcrypt.compare(password, userExist.password, (err, result) => {
            if (err) {
                throw new Error('Something went wrong!');
            }
            if (result === true) {
                res.status(200).json({ success: true, message: 'User Login Successful', token: generateAccessToken(userExist._id, userExist.isPremium) });
            }
            else {
                return res.status(401).json({ message: 'Password is incorrect' });
            }
        })

    } catch (error) {
        console.log('>>>>>>>>>Error at login User<<<<<<<<', error);
        return res.status(404).json({ success: false, message: 'User Not Found' });
    }
}

const generateAccessToken = (id, ispremiumuser) => {
    return jwt.sign({ userId: id, ispremiumuser }, process.env.SECRET_KEY);
}

exports.generateAccessToken = generateAccessToken;