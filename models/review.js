const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ReviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId, //this is telling me that an objectId belongs here and that we are going to source it from: User, which I'm requiring up top.
        ref: 'User'
    },
})


module.exports = mongoose.model('Review', ReviewSchema);
