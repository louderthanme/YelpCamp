const { string } = require('joi');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')// uses the passport-local-mongoose cause it's a model for our database which is currentyl in mongo.
const Schema = mongoose.Schema


const UserSchema = new Schema({
    email: {
        type: String,//NEEDS to be capitalize, will crash the whole app if it isn't.
        required: true,
        unique: true, //not an actual validation tool but it works for now.
    }
})

UserSchema.plugin(passportLocalMongoose) // this adds a username, hash and salt field for the password. And adds some extra methods.

module.exports = mongoose.model('User', UserSchema)