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

CommentSchema.pre('deleteOne', function (next) {
    const _id = this.getQuery()["_id"]
    mongoose.model("User").updateMany({
        'comments._id': _id
    }, {
        $pull: {
            comments: {
                _id: _id
            }
        }
    }, function (err, result) {
        if (err) {
            next(err)
        } else {
            next()
        }
    })
})

const Comment = mongoose.model("Comment", CommentSchema)
module.exports = Comment 