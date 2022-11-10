//main
const express = require('express')
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); // one of many engines used to run/parse ejs. this is the one we want to use rather than the default one
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpresError')

//mongo

main().catch(err => console.log(`oh no mongo ${err}`));
async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelp-camp');
    console.log('database from main folder connnected');
}

//route variables 
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

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

app.use((req, res, next) => {
    res.locals.success = req.flash('success'); //middleware for predefined messages that are at the moment saved on each of my routes. If there is anything in flash under 'success' I'll have acces to it in an res.locals.success
    res.locals.error = req.flash('error');
    next();
})



//app routes
app.use('/campgrounds', campgrounds) // uses the router with the /campgrounds
app.use('/campgrounds/:id/reviews', reviews) // uses the router with the /reviews

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