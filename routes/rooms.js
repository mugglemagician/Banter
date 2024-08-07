const express = require('express');
const router = express.Router();
const Room = require('../Models/Room');
const { IsLoggedIn, IsCreator, VerifyRoomPassword, VerifyRoomData } = require('../middleware');
const { catchAsync } = require('../utils');

router.get('/', catchAsync(async (req, res, next) => {
    const rooms = await Room.find();
    res.render('rooms/index', { rooms });
}));

router.get('/new', IsLoggedIn, (req, res) => {
    res.render('rooms/createRoom');
});

router.post('/', IsLoggedIn, VerifyRoomData, catchAsync(async (req, res, next) => {
    // create a room
    let { name, password } = req.body;
    name = name.trim();
    password = password.trim();
    let totalConnected = 0;
    const creator = req.user._id;
    const room = new Room({ name, password, totalConnected, creator });
    await room.save();
    req.flash('success', 'Room Created Successfully !');
    res.redirect('/rooms');
}));

router.get('/:id', VerifyRoomPassword, catchAsync(async (req, res, next) => {

    const { id } = req.params;
    const room = await Room.findById(id);
    res.render('rooms/room', { room });

}));

router.delete('/:id', IsLoggedIn, IsCreator, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Room.findByIdAndDelete(id);
    req.io.to(id).emit('roomDeleted', req.baseUrl);
    res.status(204).send();
}));


module.exports = router;