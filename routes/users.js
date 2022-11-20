const express = require('express');
const router = express.Router();
const users = require('../controllers/users')
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');


router.get('/register', users.renderRegister)

router.post('/register', catchAsync(users.register))


router.get('/login', users.renderLogin)

router.post('/login', passport.authenticate('local', { //passport.authenticate has different strategies, this is local, it could be through twitter or facebook. The failureFlash adds a flash if it doesnt work and failure redirect redirects you
    failureFlash: true,
    failureRedirect: '/login',
    keepSessionInfo: true
}), catchAsync(users.login))

router.get('/logout', users.logout);

module.exports = router;
