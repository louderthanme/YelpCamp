const { campgroundSchema, reviewSchema } = require('./schemas')
const ExpressError = require('./utils/ExpresError')
const Campground = require('./models/campground')



module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { //this method is added by passport to my request object. I am not even requiring campground with this route. My request has this method because I used app.use(passport.initialize()), app.use(passport.session()), and passport.use(new LocalStrategy(User.authenticate())). This was back in my index file
        req.session.returnTo = req.originalUrl //i'm adding the originalUrl to the session so that I can redirect the user to where they were tryting to go when they were prompted to either log in or register.
        req.flash('error', 'you must be signed in first')
        return res.redirect('/login') // I need to return this to escape the function. if I dont ill get a setHeader error because res.redirect will run as will the res.render right below
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'you do no thave permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
