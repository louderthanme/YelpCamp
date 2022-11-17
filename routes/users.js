const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');


router.get('/register', (req, res) => {
    res.render('./users/register')
})

router.post('/register', catchAsync(async (req, res) => { //the catch async sends me to the default error handler that function leads to.
    try { //this extra try/catch is there to add the req.flash in teh same page, not in a new one as the default one does
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password)//added by passports-local-mongoose, adds a passport to an instance of a user. the user is defined earlier and added into the register method. THE REGISTER METHOD automatically saves the user, so no need for user.save()

        req.login(registeredUser, e => {//it doesn't support await hence I need to add a callbackfunction. It just takes an error and passes it for it to be caught by our error handler.
            if (e) return next(e)
            req.flash('success', 'Welcome to campgrounds') //pay attention to the name of the flash, it has to match, case-wise as well
            res.redirect('/campgrounds')
        })

    } catch (e) {
        req.flash('error', `${e.message}. Try a different one please`)
        res.redirect('register')
    }

}))


router.get('/login', (req, res) => {
    console.log(req.session.returntTo)
    res.render('./users/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), catchAsync(async (req, res) => { //passport.authenticate has different strategies, this is local, it could be through twitter or facebook. The failureFlash adds a flash if it doesnt work and failure redirect redirects you
    req.flash('success', 'welcome back');
    console.log(req.session.returntTo)
    const redirectUrls = req.session.returnTo || '/campgrounds'; // this in case some one just straight clicks the log in button
    res.redirect(redirectUrls)
}))


router.get('/logout', (req, res, next) => {  // we have a next because logout requires callback function 
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', "Goodbye! See you next time");
        res.redirect('/campgrounds');
    });
});

module.exports = router;
