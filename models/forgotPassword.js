const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const passwordSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    isActive: Boolean,
    uuid: String,
})


module.exports = mongoose.model('Password', passwordSchema);