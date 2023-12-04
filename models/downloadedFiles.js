const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const downloadFileSchema = new Schema({
    fileUrl: {
        type: String,
        required: true
    },
    date: Date,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})


module.exports = mongoose.model('DownloadFile', downloadFileSchema);