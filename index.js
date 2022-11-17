//main
const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); // one of many engines used to run/parse ejs. this is the one we want to use rather than the default one
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpresError');
const passport = require('passport'); // regular passports, allows us to plug in multiple strategies for authentication
const LocalStrategy = require('passport-local');// not passport-local-mongoose, that one's just for the model. This module lets you authenticate using a username and password in your Node.js applications.
const User = require('./models/user');



//mongo

main().catch(err => console.log(`oh no mongo ${err}`));
async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelp-camp');
    console.log('database from main folder connnected');
}

//route variables 
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews');

//adjustments

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true })) // this allows me to get req.body in a post request that is usally invisible if it isnt first parsed
app.use(methodOverride("_method"))//this allows me to force a specific method on, for example, a form that only allows post/get. it could be any string I wanted
app.use(express.static(path.join(__dirname, 'public'))) // this allows me to start the app from a different directory and have the paths still work as intentende, not pick up new meaning through the context.
const sessionConfig = {
    secret: 'secret', //remove deprecation warnings lol-- could be any other string, proabbly not in your main app ever.
    resave: false, //remove deprecation warnings lol
    saveUninitialized: true,  //remove deprecation warnings lol
    cookie: {
        httpOnly: true, //extra security for the cookie, even if accessed by cross site scripting, they wouldn't get the cookie
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1000ms times 60s, times 60m, times 24hrs, times 7days - expires in a week.
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
    // store: here is where we would specify where all of this iss saved. At the moment it's just a session
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())//this initialises passport
app.use(passport.session())// for persistent login sessions. This HAS to come AFTER the normal app.use(session()) that we have in line 49
passport.use(new LocalStrategy(User.authenticate()))//requiring User model. Im saying, use the local strategy we downloaded and the authentication method is going to be located int he User model. We didn't actually add it manually to the model it got added via the passport-local-mongoose thingy.
passport.serializeUser(User.serializeUser())//telling passport how to serialise a user (refers to how we store data in a session)
passport.deserializeUser(User.deserializeUser())//how to get the user out of that session


//giving access to info added by passport//express-session and saving it on the session.
app.use((req, res, next) => {
    res.locals.success = req.flash('success'); //middleware for predefined messages that are at the moment saved on each of my routes. If there is anything in flash under 'success' I'll have access to it in an res.locals.success
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user //req.user is addedby passport. I have immediate access to it. It contains deserialized info about the user using the platform at that specific moment. It contains a username and an email.
    next();
})

app.get('/fakeuser', async (req, res) => {
    const user = new User({ email: 'ruben@fluent.com', username: 'ruben' });
    const newUser = await User.register(user, 'secret')//added by passports-local-mongoose, adds a passport to an instance of a user. the user is defined earlier and added into the register method
    res.send(newUser)
})




//app routes
app.use('/', userRoutes) // uses the router with the /users
app.use('/campgrounds', campgroundRoutes) // uses the router with the /campgrounds
app.use('/campgrounds/:id/reviews', reviewRoutes) // uses the router with the /reviews

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh, no! Something went wrong!"
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('serving on port 3000')
}) 