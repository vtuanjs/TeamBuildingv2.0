const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const JobSchema = new Schema({
    title: { type: String, required: true },
    description: {type: String, default: ""},
    isStored: {type: Number, default: 0},
    isClosed: {type: Number, default: 0},
    isCompleted: {type: Number, default: 0},
    parentJob: {type: ObjectId, ref: 'Job'},
    members: [{ type: ObjectId, ref: "User" }],
    attachFile: [{ type: String }],
    comment: [{ type: ObjectId, ref: "Comment" }]
}, {timestamps: true, autoCreate: true})

const Job = mongoose.model("Job", JobSchema)
module.exports = Job