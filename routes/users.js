const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const passport = require('passport');
const { VerifyRegisterData, VerifyLoginData, IsLoggedIn } = require('../middleware');
const { catchAsync } = require('../utils');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', VerifyRegisterData, catchAsync(async (req, res, next) => {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash('success', 'Registered Succesfully !');
        res.redirect('/rooms');
    });

}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', VerifyLoginData, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome Back !');
    res.redirect('/rooms');
});

router.get('/logout', IsLoggedIn, (req, res) => {
    req.logout((err) => {
        if (err) {
            req.flash('error', 'Cannot Logout at the moment.');
            res.redirect('/rooms');
        }
        else {
            req.flash('success', 'Logged Out succesfully !');
            res.redirect('/rooms');
        }
    });
});



module.exports = router