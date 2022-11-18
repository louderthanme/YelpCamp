const mongoose = require('mongoose');
const Review = require('./review');  //pasing in the review model so that when deleting the middleware knows wtf a review is.
const User = require('./user')
const Schema = mongoose.Schema

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    imageUrl: String,
    author: {
        type: Schema.Types.ObjectId, //this is telling me that an objectId belongs here and that we are going to source it from: User, which I'm requiring up top.
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

//I'm adding this post hook inside the campgroundschema before compiling it to say: when involved with this particulary model (campground.js) anytime this following middleware is triggered (findOneAndDelete) do the following. This middleware is triggered by the method  findByIdAndDelete. It's that one specifically just because in my delete route in my index I specified I wanted to use that one. Which means that if I used with a different method to delete it then I would have to change this post hook because the middleware that other hypothetical way I'm deleting would probably trigger a different

CampgroundSchema.post('findOneAndDelete', async function (doc) { //doc refers to the thing that was deleted by the findByIdAndDelete method
    //findOneAndDelete is the name of the middleware that is triggered when i use the findByIdAndDelete method, by adding this 'post' hook I'm asking mongoose to do this right after the findOneAndDelete middleware is triggered, since it's middleware it will run EVERY time that that middleware is called.
    if (doc) { // if we did find a doc (delete the thing) then
        await Review.deleteMany({   //remove instances of the Review model. Which instances? well the ones with ids found in ($in-mongoose operator) the deleted doc, the portion of reviews (the object ids in the array of reviews) still exists before this
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model('Campground', CampgroundSchema); // this is where the model is compiled. The pre/post hooks must be defined before compiling the model or else they won't work
