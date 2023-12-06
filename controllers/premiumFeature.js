const Expense = require("../models/expense");
const User = require("../models/user");
const AWS = require('aws-sdk');
const DownloadedFiles = require('../models/downloadedFiles');

function uploadToS3(data, filename) {

    let s3Bucket = new AWS.S3({
        accessKeyId: process.env.IAM_USER_KEY,
        secretAccessKey: process.env.IAM_USER_SECRET
    })

    let params = {
        Bucket: process.env.BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read',
    }
    return new Promise((resolve, reject) => {
        s3Bucket.upload(params, (err, s3response) => {  //async
            if (err) {
                console.log('Something Went Wrong', err);
                reject(err)
            } else {
                resolve(s3response.Location);
            }
        })
    })
}

exports.downloadExpense = async (req, res, next) => {
    try {
        if (!req.user.isPremium) {
            return res.status(401).json({ message: 'Buy Premium to Download Report', success: false })
        }
        const expenses = await Expense.find({ userId: req.user._id });
        const stringifiedExpenses = JSON.stringify(expenses);

        const userId = req.user._id;

        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileUrl = await uploadToS3(stringifiedExpenses, filename);
        const downloadFile = new DownloadedFiles({
            fileUrl: fileUrl,
            date: Date.now(),
            userId: req.user._id,
        })
        await downloadFile.save()
        res.status(200).json({ url: fileUrl, success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ url: '', success: false, error: err });
    }
}

exports.recentlyDownloadedFiles = async (req, res, next) => {
    try {
        const recentdownloadedfiles = await DownloadedFiles.find({ userId: req.user._id });

        res.status(200).json(recentdownloadedfiles)
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.showLeaderboard = async (req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const limit = 15;
        const offset = limit * (page - 1);

        const count = await User.countDocuments();
        const leaderboardofUsers = await User.find()
            .select('name totalExpense')
            .limit(limit)
            .skip(offset)
            .sort({
                totalExpense: 'desc'
            })

        Promise.all(([count, leaderboardofUsers]))
            .then(([count, leaderboardofUsers]) => {
                res.status(200).json({
                    leaderboardofUsers: leaderboardofUsers,
                    currPage: page,
                    hasNextPage: limit * page < count,
                    nextPage: page + 1,
                    hasPrevPage: page > 1,
                    prevPage: page - 1,
                    lastpage: Math.ceil(count / limit),
                });
            })
    }
    catch (error) {
        console.log(error);
    }
}

