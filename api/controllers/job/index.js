const Job = require('./job.model')
const User = require('../user/user.model')
const Project = require('../project/project.model')
const Notify = require('../notify/notify.model')
const mongoose = require('mongoose')
const INVITE_JOIN_JOB = 'Invite Join Job'

const pushJobToUser = (jobId, user) => {
    user.jobs.push({
        _id: jobId,
        role: "owner"
    })

    return user.save()
}

module.exports.postJob = async (req, res, next) => {
    const { title, description, isAllowMemberAddMember, isAllowMemberCreateJob } = req.body
    const { projectId } = req.query
    const signedUser = req.user
    try {
        const job = await Job.create(
            {
                title,
                description,
                allowed: {
                    isAllowMemberAddMember,
                    isAllowMemberCreateJob,
                },
                members: [signedUser._id],
                parent: projectId,
                onModel: 'Project'
            }
        )

        await pushJobToUser(job._id, signedUser)

        res.json({ message: `Create job successfully!`, job })
    } catch (error) {
        next(error)
    }
}

// const setIsDeletedStatus = (jobId, status) => {
//     return Job.findByIdAndUpdate(
//         jobId,
//         { isDeleted: status },
//         {
//             upsert: true,
//             new: true
//         }
//     ).select('title isDeleted')
// }

// module.exports.deleteJob = async (req, res, next) => {
//     const { jobId } = req.params
//     try {
//         const job = await setIsDeletedStatus(jobId, 1)

//         if (!job) throw "Can not find job"

//         res.json({ message: `Send job ${job.title} to trash successfully!`, job })
//     } catch (error) {
//         next(error)
//     }
// }

// module.exports.undoDeleteJob = async (req, res, next) => {
//     const { jobId } = req.params
//     try {
//         const job = await setIsDeletedStatus(jobId, 0)

//         if (!job) throw "Can not find job"

//         res.json({ message: `Restore job ${job.title} successfully!`, job })
//     } catch (error) {
//         next(error)
//     }
// }

// module.exports.deleteImmediately = async (req, res, next) => {
//     const { jobId } = req.params

//     try {
//         const raw = await Job.deleteOne({ _id: jobId })

//         res.json({ message: "Delete job successfully!", raw })
//     } catch (error) {
//         next(error)
//     }
// }

// const setIsStoredStatus = (jobId, status) => {
//     return Job.findByIdAndUpdate(
//         jobId, { isStored: status },
//         { upsert: true, new: true }
//     ).select('title isStored')
// }

// module.exports.storedJob = async (req, res, next) => {
//     const { jobId } = req.params
//     try {
//         const job = await setIsStoredStatus(jobId, 1)

//         if (!job) throw "Can not find job"

//         res.json({ message: `Stored job ${job.title} successfully!`, job })
//     } catch (error) {
//         next(error)
//     }
// }

// module.exports.undoStoredJob = async (req, res, next) => {
//     const { jobId } = req.params
//     try {
//         const job = await setIsStoredStatus(jobId, 0)

//         if (!job) throw "Can not find job"

//         res.json({ message: `Undo Stored job successfully!`, job })
//     } catch (error) {
//         next(error)
//     }
// }

// module.exports.updateJob = async (req, res, next) => {
//     const { jobId } = req.params
//     const { title, description } = req.body

//     try {
//         const job = await Job.findByIdAndUpdate(
//             jobId,
//             {
//                 ...(title && { title }),
//                 ...(description && { description }),
//             },
//             { new: true }
//         )

//         if (!job) throw "Can not find job"

//         res.json({ message: `Update job successfully!`, job })
//     } catch (error) {
//         next(error)
//     }
// }

// const queryGetJobs = (byUser, filter) => {
//     let query = {
//         members: { $in: [byUser._id] }
//     }

//     if (!filter) {
//         query = {
//             ...query,
//             isStored: 0,
//             isDeleted: 0
//         }
//     }

//     if (filter) {
//         switch (filter) {
//             case 'isStored':
//                 query = {
//                     ...query,
//                     isStored: 1
//                 }
//                 break
//             case 'isDeleted':
//                 query = {
//                     ...query,
//                     isDeleted: 1
//                 }
//                 break
//             default: break
//         }
//     }

//     return query
// }

// module.exports.getJobs = async (req, res, next) => {
//     const { filter } = req.query
//     const signedUser = req.user

//     try {
//         const jobs = await Job.find(
//             queryGetJobs(signedUser, filter),
//             "title createdAt"
//         )

//         if (!jobs) throw "Can not show job"

//         res.json({ jobs })
//     } catch (error) {
//         next(error)
//     }
// }

// module.exports.getJob = async (req, res, next) => {
//     const { jobId } = req.params

//     try {
//         const job = await Job.findById(jobId)

//         if (!job) throw "Wrong job id"

//         res.json({ job })
//     } catch (error) {
//         next(error)
//     }
// }

// const populateJobInUser = (userId) => {
//     return User
//         .findById(userId)
//         .populate('jobs._id', 'title')
// }

// const getVerifyUsers = (arrayUserIds) => {
//     return User.find({ _id: { $in: arrayUserIds } })
// }


// const getJobPropertyInUser = (user, jobId) => {
//     return user.jobs.find(
//         job => job._id.equals(jobId)
//     )
// }

// const splitUserIds = (userIds) => {
//     if (typeof userIds === 'string') {
//         return userIds.split(',').map(item => {
//             return item.trim()
//         })
//     } else {
//         return userIds
//     }
// }

// const setMembersInJob = ({ jobId, userIds, session }) => {
//     return Job.findOneAndUpdate(
//         { _id: jobId },
//         { $addToSet: { members: { $each: userIds } } },
//         { new: true }
//     ).select('members').session(session)
// }

// const pushJobToUsers = ({ jobId, userIds, session }) => {
//     return User.updateMany(
//         {
//             _id: { $in: userIds },
//             "jobs._id": { $ne: jobId }
//         },
//         {
//             $push: {
//                 jobs: {
//                     _id: jobId,
//                     role: "user",
//                     isJoined: 0
//                 }
//             }
//         }
//     ).session(session)
// }

// const createNotifyJoinJob = ({ message, jobId, userIds, session }) => {
//     let arrayNotifyCreate = []
//     for (let index = 0; index < userIds.length; index++) {
//         arrayNotifyCreate.push({
//             title: INVITE_JOIN_PROJECT,
//             message: message,
//             secretKey: { jobId },
//             user: userIds[index]
//         })
//     }

//     return Notify.create(arrayNotifyCreate, { session })
// }

// const isAllowed = (job, role) => {
//     if (!job.allowed.isAllowMemberAddMember
//         && role === 'user')
//         return false

//     return true
// }

// module.exports.addMembers = async (req, res, next) => {
//     const { userIds } = req.body
//     const { jobId } = req.params
//     const signedUser = req.user
//     const session = await mongoose.startSession()
//     try {
//         await session.withTransaction(async () => {
//             const arrayUserIds = splitUserIds(userIds)

//             const [populateUser, verifyUsers] = await Promise.all([
//                 populateJobInUser(signedUser._id),
//                 getVerifyUsers(arrayUserIds)
//             ])

//             const jobInUser = getJobPropertyInUser(populateUser, jobId)
//             const verifyUserIds = verifyUsers.map(user => user._id)

//             if (!jobInUser) throw 'User is not in job'
//             if (verifyUsers.length === 0) throw "Can not find any user"

//             const [jobWillAddMembers, ,] = await Promise.all([
//                 setMembersInJob({ jobId, userIds: verifyUserIds, session }),
//                 pushJobToUsers({ jobId, userIds: verifyUserIds, session }),
//                 createNotifyJoinJob({
//                     message: `${signedUser.name} invite you join job ${jobInUser._id.title}`,
//                     jobId,
//                     userIds: arrayUserIds,
//                     session
//                 })
//             ])

//             if (!jobWillAddMembers)
//                 throw "Can not find job"

//             if (!isAllowed(jobWillAddMembers, jobInUser.role))
//                 throw 'Member can not add member'

//             res.json({
//                 message: `Add member successfully!`, job: jobWillAddMembers
//             })
//         })
//     } catch (error) {
//         next(error)
//     }
// }

// module.exports.agreeJoinJob = async (req, res, next) => {
//     const { jobId } = req.params
//     const signedUser = req.user
//     try {
//         await Promise.all([
//             User.updateOne(
//                 { _id: signedUser._id, 'jobs._id': jobId },
//                 { $set: { 'jobs.$.isJoined': 1 } }
//             ),

//             Notify.updateOne(
//                 { user: signedUser._id, title: INVITE_JOIN_PROJECT, 'secretKey.jobId': jobId },
//                 { $unset: { secretKey: { jobId } }, isAction: 1 }
//             )
//         ])

//         res.json({ message: 'Join job successfully!' })
//     } catch (error) {
//         next(error)
//     }
// }

// module.exports.disAgreeJoinJob = async (req, res, next) => {
//     const { jobId } = req.params
//     const signedUser = req.user
//     try {
//         await Promise.all([
//             User.updateOne(
//                 { _id: signedUser._id, 'jobs._id': jobId },
//                 { $pull: { jobs: { _id: jobId } } }
//             ),

//             Job.updateOne(
//                 { _id: jobId },
//                 { $pull: { members: signedUser._id } }
//             ),

//             Notify.updateOne(
//                 {
//                     user: signedUser._id,
//                     title: INVITE_JOIN_PROJECT,
//                     'secretKey.jobId': jobId
//                 },
//                 {
//                     $unset: { secretKey: { jobId } },
//                     isAction: 1
//                 }
//             )
//         ])

//         res.json({ message: 'Disagree join job successfully!' })
//     } catch (error) {
//         next(error)
//     }
// }


// module.exports.removeMembers = async (req, res, next) => {
//     const { userIds } = req.body
//     const { jobId } = req.params

//     const session = await mongoose.startSession()
//     try {
//         await session.withTransaction(async () => {

//             let arrayUserIds = splitUserIds(userIds)

//             const [job,] = await Promise.all([
//                 Job.findByIdAndUpdate(
//                     jobId,
//                     {
//                         $pullAll: { members: arrayUserIds }
//                     },
//                     { new: true }
//                 ).session(session),

//                 User.updateMany(
//                     { _id: { $in: arrayUserIds } },
//                     { $unset: { jobs: { _id: jobId } } }
//                 ).session(session)
//             ])

//             if (!job)
//                 throw "Can not find job"

//             return res.json({ message: `Remove member successfully!`, job })
//         })
//     } catch (error) {
//         next(error)
//     }
// }

// module.exports.changeUserRole = async (req, res, next) => {
//     const { jobId } = req.params
//     const { userId, role } = req.body

//     const session = await mongoose.startSession()
//     try {
//         await session.withTransaction(async () => {
//             const [job, user] = await Promise.all([
//                 Job.findById(jobId),
//                 User.findOneAndUpdate(
//                     { _id: userId },
//                     { $set: { "jobs.$[element].role": role } },
//                     {
//                         arrayFilters: [{ 'element._id': jobId }],
//                         new: true
//                     }
//                 ).session(session)
//             ])

//             if (!user || !job) throw "Can not find user/job or user not a member in job"

//             res.json({
//                 // job, user
//                 message: `${user.name} is now ${role}!`, user: { _id: user._id, jobs: user.jobs }
//             })
//         })
//     } catch (error) {
//         next(error)
//     }
// }