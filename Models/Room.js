const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    userId: {
        type: String
    },
    socketId: {
        type: String
    },
    username: {
        type: String
    },
    message: {
        type: String
    }
}, { _id: false });


const roomSchema = new Schema({
    name: {
        type: String,
        required: [true, "Room name is required !"]
    },
    password: {
        type: String
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    totalConnected: {
        type: Number
    },
    oldMessages: {
        type: [chatSchema]
    }
});


module.exports = mongoose.model('Room', roomSchema);