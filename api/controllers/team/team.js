const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const TeamSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    members: [{
        type: ObjectId,
        ref: "User"
    }]
}, {
    timestamps: true,
    autoCreate: true
})

const Team = mongoose.model('Team', TeamSchema)
module.exports = Team