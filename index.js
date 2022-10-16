const express = require('express')
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const engine = require('ejs-mate'); // one of many engines used to run/parse ejs. this is the one we want to use rather than the default one
const catchAsync = require('./utils/catchAsync')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpresError')
const { campgroundSchema } = require('./schemas')


main().catch(err => console.log(`oh no mongo ${err}`));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelp-camp');
    console.log('database from main folder connnected');
}


app.engine('ejs', engine)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true })) // this allows me to get req.body in a post request that is usally invisible if it isnt first parsed
app.use(methodOverride("_method"))//this allows me to force a specific method on, for example, a form that only allows post/get. it could be any string I wanted


const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('./campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('./campgrounds/new')
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))




app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(req.params.id);
    const url = campground.imageUrl;
    res.render('./campgrounds/show', { campground, url })
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);
    console.log(campground.location)
    res.render(`./campgrounds/edit`, { campground })
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) // In an object literal, the spread (...) syntax enumerates the properties of an object and adds the key-value pairs to the object being created. they make a javascript object into an object that mongoose can accept
    res.redirect(`./${campground.id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

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