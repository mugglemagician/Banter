const mongoose = require('mongoose');
const Room = require('../Models/Room');
const seedHelper = require('./seedHelper');

mongoose.connect('mongodb://localhost:27017/chatAppDemo')
    .then(() => {
        console.log("Database Connected !");
    })
    .catch(err => {
        console.log("Connection Failed !");
    });




const seedDb = async () => {
    await Room.deleteMany({});
    for (let name of seedHelper) {
        new Room({
            name,
            password: 123,
            creator: '66b0e4a549984a5cf71e977d',
            totalConnected: 0,
            oldMessages: []
        }).save();
    }

    console.log("Seed Successfull !");
}



seedDb();
