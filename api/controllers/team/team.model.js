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

TeamSchema.pre('deleteOne', function (next) {
    const _id = this.getQuery()["_id"]
    mongoose.model("User").updateMany({
        'teams._id': _id
    }, {
        $pull: {
            teams: {
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

const Team = mongoose.model('Team', TeamSchema)
module.exports = Team