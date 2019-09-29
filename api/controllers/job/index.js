const Job = require('./job')
const User = require('../user/user.model')
const mongoose = require('mongoose')

module.exports.postJob = async (req, res, next) => {
    const { title, description, parentJobId } = req.body
    const signedUser = req.user
    try {
        let queryCreate = {
            title,
            description,
            members: [signedUser._id]
        }

        if (parentJobId) {
            queryCreate = {
                ...queryCreate,
                parentJob: parentJobId
            }
        }
        const job = await Job.create(queryCreate)

        signedUser.jobs.push({ id: job._id, role: "owner" })
        await signedUser.save()

        res.json({ message: `Create job successfully!`, job })
    } catch (error) {
        next(error)
    }
}

module.exports.storedJob = async (req, res, next) => {
    const { jobId } = req.params
    try {
        const job = await Job.findByIdAndUpdate(jobId, { isStored: 1 }, { upsert: true, new: true }).select('title isStored')

        if (!job) throw "Can not find job"

        res.json({ message: `Stored Job successfully!`, job })
    } catch (error) {
        next(error)
    }
}

module.exports.undoStoredJob = async (req, res, next) => {
    const { jobId } = req.params
    try {
        const job = await Job.findByIdAndUpdate(jobId, { isStored: 0 }, { upsert: true, new: true }).select('title isStored')

        if (!job) throw "Can not find job"

        res.json({ message: `Restore Job successfully!`, job })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteJob = async (req, res, next) => {
    const { jobId } = req.params

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const [job, _] = await Promise.all([
                Job.findByIdAndDelete(jobId).session(session),

                User.updateMany(
                    { "jobs.id": jobId },
                    { $pull: { jobs: { id: jobId } } }
                ).session(session)
            ])

            if (!job)
                throw "Can not find job or user"

            res.json({ message: "Delete job successfully!" })
        })
    } catch (error) {
        next(error)
    }
}

module.exports.updateJob = async (req, res, next) => {
    const { jobId } = req.params
    const { title, description } = req.body

    const query = {
        ...(title && { title }),
        ...(description && { description }),
    }
    try {
        const job = await Job.findByIdAndUpdate(
            jobId, query, { new: true }
        )

        if (!job) throw "Can not find job"

        res.json({ message: `Update job ${job.title} successfully!`, job })
    } catch (error) {
        next(error)
    }
}

module.exports.getJobs = async (req, res, next) => {
    const { parentJobId } = req.query

    try {
        const jobs = await Job.find(
            { parentJob: parentJobId },
            "title createdAt"
        )

        if (!jobs) throw "Can not show job"

        res.json({ jobs })
    } catch (error) {
        next(error)
    }
}

module.exports.getJob = async (req, res, next) => {
    const { jobId } = req.params

    try {
        const job = await Job.findById(jobId)

        if (!job) throw "Wrong job id"

        res.json({ job })
    } catch (error) {
        next(error)
    }
}

module.exports.addMembers = async (req, res, next) => {
    const { userIds } = req.body
    const { jobId } = req.params

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            let arrayUserIds = userIds
            if (typeof userIds === 'string') {
                arrayUserIds = userIds.split(',').map(item => {
                    return item.trim()
                })
            }

            const users = await User.find({ _id: { $in: arrayUserIds } })

            if (users.length === 0) throw "Can not find any user"

            const validUserIds = users.map(user => user._id)

            const [job, _] = await Promise.all([
                Job.findOneAndUpdate(
                    { _id: jobId },
                    { $addToSet: { members: { $each: validUserIds } } },
                    { new: true }
                ).select('members').session(session),

                User.updateMany(
                    { _id: { $in: validUserIds }, "jobs.id": { $ne: jobId } },
                    { $push: { jobs: { id: jobId, role: "employee" } } }
                ).session(session)
            ])

            if (!job)
                throw "Can not find job"

            return res.json({
                message: `Add member successfully!`, job
            })
        })
    } catch (error) {
        next(error)
    }
}

module.exports.removeMember = async (req, res, next) => {
    const { userId } = req.body
    const { jobId } = req.params

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const [job, _] = await Promise.all([
                Job.findByIdAndUpdate(jobId, { $pull: { members: userId } }, { new: true }).session(session),
                User.findByIdAndUpdate(userId, { $unset: { "jobs.id": jobId } }).session(session)
            ])

            if (!job)
                throw "Can not find job"

            return res.json({ message: `Remove member successfully!`, job })
        })
    } catch (error) {
        next(error)
    }
}

module.exports.changeUserRole = async (req, res, next) => {
    const { jobId } = req.params
    const { userId, role } = req.body
    const signedUser = req.user

    if (signedUser.role != "admin" && role === "admin") {
        //Only admin can make user become admin. If not, role = manager
        role = "manager"
    }

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const [job, user] = await Promise.all([
                Job.findById(jobId),
                User.findOneAndUpdate(
                    { _id: userId, "jobs.id": jobId },
                    { $set: { "jobs.$.role": role } },
                    { new: true }
                ).session(session)
            ])

            if (!user || !job) throw "Can not find user/job or user not a member in job"

            res.json({
                message: `${user.title} is now ${role}!`, user: { _id: user._id, jobs: user.jobs }
            })
        })
    } catch (error) {
        next(error)
    }
}