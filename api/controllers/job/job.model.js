const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const JobSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    isStored: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Number,
        default: 0
    },
    isCompleted: {
        type: Number,
        default: 0
    },
    author: [{
        type: ObjectId,
        ref: "User"
    }],
    allowed: {
        isAllowMemberAddMember: {
            type: Number,
            default: 1
        },
    },
    attachFile: [{
        type: String
    }],
    comment: [{
        type: ObjectId,
        ref: "Comment"
    }],
    parent: {
        type: ObjectId,
        required: true,
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        required: true,
        enum: ['Project', 'Job']
    }
}, {
    timestamps: true,
    autoCreate: true
})

JobSchema.pre('deleteOne', function (next) {
    const _id = this.getQuery()["_id"]
    mongoose.model("User").updateMany({
        'jobs._id': _id
    }, {
        $pull: {
            jobs: {
                _id
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

const Job = mongoose.model("Job", JobSchema)
module.exports = Job