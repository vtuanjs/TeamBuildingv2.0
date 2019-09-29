const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const NotifySchema = new Schema({
    title: { type: String, required: true },
    message: { type: String, default: " " },
    secretKey: {type: Object},
    isAction: { type: Number, default: 0 },
    user: {type: ObjectId, ref: 'User'}
}, { timestamps: true, autoCreate: true })

const Notify = mongoose.model("Notify", NotifySchema)
module.exports = Notify