const express = require('express');
const router = express.Router();
const { IsLoggedInApi } = require('../middleware');

router.get('/getUserId', IsLoggedInApi, (req, res) => {
    const data = { userId: res.locals.currentUser._id };
    res.json(data);
});



module.exports = router;