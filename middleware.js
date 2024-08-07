const Room = require('./Models/Room');
const { catchAsync } = require('./utils');

module.exports.IsLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in first !');
        res.redirect('/login');
    }
    else {
        next();
    }
}

module.exports.IsLoggedInApi = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.json({});
    }
    else {
        next();
    }
}

module.exports.IsCreator = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room.creator.equals(req.user._id)) {
        req.flash('error', 'You do not have permissions to do that !');
        res.redirect('/rooms');
    }
    else {
        next();
    }
});

module.exports.VerifyRoomPassword = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { password } = req.query;
    const room = await Room.findById(id);
    if (room.password === password || (!room.password && password === '')) {
        next();
    }
    else {
        req.flash('error', 'Incorrect Password !');
        res.redirect('/rooms');
    }
});

module.exports.VerifyRoomData = (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        req.flash('error', 'Try Again !');
        res.redirect('/rooms/new');
    }
    else {
        next();
    }
}

module.exports.VerifyRegisterData = (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        req.flash('error', 'Try Again !');
        res.redirect('/register');
    }
    else {
        next();
    }
}

module.exports.VerifyLoginData = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.redirect('/login');
    }
    else {
        next();
    }
}