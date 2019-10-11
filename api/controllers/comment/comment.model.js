const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const CommentSchema = new Schema({
    body: {type: String, default: ""},
    edited: [{
        body: String,
        createdAt: Date,
        _id: false
    }],
    author: { type: ObjectId, ref: "User" },
    commentOn: { type: ObjectId, ref: 'Job' },
}, {timestamps: true, autoCreate: true})

const Comment = mongoose.model("Comment", CommentSchema)
module.exports = Comment 