const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const ProjectSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: " "
    },
    isStored: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Number,
        default: 0
    },
    members: [{
        type: ObjectId,
        ref: "User"
    }],
    allowed: {
        isAllowMemberAddMember: {
            type: Number,
            default: 1
        },
        isAllowMemberCreateJob: {
            type: Number,
            default: 1
        }
    }
}, {
    timestamps: true,
    autoCreate: true
})

ProjectSchema.pre('deleteOne', function (next) {
    const _id = this.getQuery()["_id"]
    mongoose.model("User").updateMany({
        'projects._id': _id
    }, {
        $pull: {
            projects: {
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

const Project = mongoose.model("Project", ProjectSchema)
module.exports = Project