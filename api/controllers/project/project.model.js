const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Schema.Types.ObjectId

const ProjectSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, default: " " },
    isStored: { type: Number, default: 0 },
    isDeleted: { type: Number, default: 0 },
    members: [{ type: ObjectId, ref: "User" }],
    allowed: {
        isAllowMemberAddMember: { type: Number, default: 1 },
        isAllowMemberCreateJob: { type: Number, default: 1 }
    }
}, { timestamps: true, autoCreate: true })

ProjectSchema.pre('findByIdAndDelete', function (next) {
    const project = this
    project.model('User').updateMany(
        { "projects.id": project._id },
        {
            $pull: {
                projects: { id: project._id }
            }
        },
        next
    )
});

const Project = mongoose.model("Project", ProjectSchema)
module.exports = Project