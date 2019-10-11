const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const TeamSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    author: {
        type: ObjectId,
        ref: 'User'
    },
    isPublic: {
        type: Number,
        default: 1
    },
    allowed: {
        isAllowMemberAddMember: {
            type: Number,
            default: 1
        }
    }
}, {
    timestamps: true,
    autoCreate: true
})

const Team = mongoose.model('Team', TeamSchema)
module.exports = Team