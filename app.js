if (process.env.NODE_ENV !== 'production') { //process.env.node_env is an environment variable, we can run our coude in production or in development, this says if we are in production/developement mode. This says, if we are NOT in production mode, i.e. we are on development mode as we are by default, then give us access to the stuff inside this file
    require('dotenv').config(); //this gives me access to the key-value pairs defined in the .env file .// this is temporal, when in production we just set this variable as available to the environment.
}


//main
const express = require('express');
const app = express();
const path = require('path') //allows me to use a default path name I can specify
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); // one of many engines used to run/parse ejs. this is the one we want to use rather than the default one
const session = require('express-session'); npm
const flash = require('connect-flash'); //The flash is a special area of the session used for storing messages. Messages are written to the flash and cleared after being displayed to the user. 
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport'); // regular passports, allows us to plug in multiple strategies for authentication
const LocalStrategy = require('passport-local');// not passport-local-mongoose, that one's just for the model. This module lets you authenticate using a username and password in your Node.js applications.
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');



const multer = require('multer') //middleware to handle multipart/farm-data in our forms
const upload = multer({ dest: 'uploads/' }) //where the file will be saved, at the moment it's on this folder, irl you wouldn't save it on a computer you'd upload it to a server
const dbUrl = 'mongodb://localhost:27017/yelp-camp'
// mongoose.connect('mongodb://localhost:27017/yelp-camp');


// connect- to web


//mongo
main().catch(err => console.log(`oh no mongo ${err}`));
async function main() {
    await mongoose.connect(dbUrl);
    console.log('database from main folder connnected');
}

//route variables 
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews');

//adjustments

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // this allows me to get req.body in a post request that is usally invisible if it isnt first parsed
app.use(methodOverride("_method"));//this allows me to force a specific method on, for example, a form that only allows post/get. it could be any string I wanted
app.use(express.static(path.join(__dirname, 'public'))); // this allows me to start the app from a different directory and have the paths still work as intentende, not pick up new meaning through the context.
app.use(mongoSanitize({
    replaceWith: '_'
})); //package used to sanitize things entered into fields that could be used to inject some mongo, replaces $ with _

helmet({})

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,  // how often to save the session -- in seconds
    crypto: {
        secret: 'secret'
    }
})

store.on('error', function (e) {
    console.log('session store error', e)
})

///configuration of session
const sessionConfig = {
    store, //store:store
    name: 'session',
    secret: 'secret', //remove deprecation warnings lol-- could be any other string, proabbly not in your main app ever.
    resave: false, //remove deprecation warnings lol
    saveUninitialized: true,  //remove deprecation warnings lol
    cookie: {
        httpOnly: true, //extra security for the cookie, even if accessed by cross site scripting, they wouldn't get the cookie
        // secure: true, // this one only works with httpS - currently off because we haven't deployed and localhost isn't http
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1000ms times 60s, times 60m, times 24hrs, times 7days - expires in a week. -- in ms
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
    // console.log(req.query)
    res.locals.success = req.flash('success'); //middleware for predefined messages that are at the moment saved on each of my routes. If there is anything in flash under 'success' I'll have access to it in an res.locals.success
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user //req.user is addedby passport. I have immediate access to it. It contains deserialized info about the user using the platform at that specific moment. It contains a username and an email.
    next();
})

//app routes
app.use('/', userRoutes) // uses the router with the /users
app.use('/campgrounds', campgroundRoutes) // uses the router with the /campgrounds
app.use('/campgrounds/:id/reviews', reviewRoutes) // uses the router with the /reviews

app.get('/', (req, res) => {
    res.render('home')
})

// app.use((req, res, next) => {
//     if (
//         !["/login", "/register"].includes(req.originalUrl) &&
//         req.method == "GET") {
//         req.session.lastGetRequest = req.originalUrl;
//     }
//     next();
// });  --- option of redirecting properly on any request thats not a get request

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