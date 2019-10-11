const Job = require('./job.model')
const User = require('../user/user.model')
const Notify = require('../notify/notify.model')
const mongoose = require('mongoose')
const INVITE_JOIN_JOB = 'Invite Join Job'

const pushJobToUser = (jobId, user) => {
    user.jobs.push({
        _id: jobId,
        role: "owner",
        isJoined: 1
    })

    return user.save()
}

const pushJobToProjectOwner = (jobId, projectId) => {
    return User.updateOne({
        'projects._id': projectId,
        'projects.role': 'owner'
    }, {
        $addToSet: {
            jobs: {
                _id: jobId,
                role: 'owner',
                isJoined: 1
            }
        }
    }
    )
}

module.exports.postJob = async (req, res, next) => {
    const {
        title,
        description,
        isAllowMemberAddMember,
    } = req.body
    const projectId = req.query.projectId
    const signedUser = req.user
    try {
        const job = await Job.create({
            title,
            description,
            allowed: {
                isAllowMemberAddMember,
            },
            author: signedUser._id,
            parent: projectId,
            onModel: 'Project'
        })
        await Promise.all([
            pushJobToUser(job._id, signedUser),
            pushJobToProjectOwner(job._id, projectId)
        ])

        return res.json({
            message: `Create job successfully!`,
            job
        })
    } catch (error) {
        next(error)
    }
}

const pushJobToParentJobOwner = (jobId, parentJobId) => {
    return User.updateOne({ 
        'jobs._id': parentJobId,
        'jobs.role': 'owner'
    },{
            $addToSet: {
                jobs: {
                    _id: jobId,
                    role: 'owner',
                    isJoined: 1
                }
            }
        }
    )
}

module.exports.postSubJob = async (req, res, next) => {
    const {
        title,
        description,
        isAllowMemberAddMember,
    } = req.body
    const parentJobId = req.query.jobId
    const signedUser = req.user
    try {
        const parentJob = await Job.findById(parentJobId)
        if (!parentJob) throw 'Job not found'

        const job = await Job.create({
            title,
            description,
            allowed: {
                isAllowMemberAddMember,
            },
            author: signedUser._id,
            parent: parentJobId,
            onModel: 'Job'
        })

        await Promise.all([
            pushJobToUser(job._id, signedUser),
            pushJobToParentJobOwner(job._id, parentJobId)
        ])

        return res.json({
            message: `Create job successfully!`,
            job
        })
    } catch (error) {
        next(error)
    }
}

const filterJob = (query, filter) => {
    if (!filter) {
        return {
            ...query,
            isCompleted: 0,
            isDeleted: 0
        }
    }

    switch (filter) {
        case 'isCompleted':
            query = {
                ...query,
                isCompleted: 1
            }
            break
        case 'isDeleted':
            query = {
                ...query,
                isDeleted: 1
            }
            break
        default:
            break
    }

    return query
}

const queryGetJobs = (projectId, filter) => {
    let query = {
        parent: projectId,
        onModel: 'Project'
    }

    return filterJob(query, filter)
}

module.exports.getJobs = async (req, res, next) => {
    const filter = req.query.filter
    const { projectId } = req.query

    try {
        const jobs = await Job.find(
            queryGetJobs(projectId, filter),
            "title createdAt"
        )

        if (!jobs) throw "Can not show job"

        return res.json({
            jobs
        })
    } catch (error) {
        next(error)
    }
}

const queryGetSubJobs = (jobId, filter) => {
    let query = {
        parent: jobId,
        onModel: 'Job'
    }

    return filterJob(query, filter)
}

module.exports.getSubJobs = async (req, res, next) => {
    const filter = req.query.filter
    const { jobId } = req.query

    try {
        const jobs = await Job.find(
            queryGetSubJobs(jobId, filter),
            "title createdAt"
        )

        if (!jobs) throw "Can not show job"

        return res.json({
            jobs
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getJob = async (req, res, next) => {
    const jobId = req.params.jobId

    try {
        const job = await Job.findById(jobId)

        if (!job) throw "Wrong job id"

        return res.json({
            job
        })
    } catch (error) {
        next(error)
    }
}

const setJobStatus = ({ jobId, status, value }) => {
    let queryUpdate
    switch (status) {
        case 'isDeleted':
            queryUpdate = { isDeleted: value }
            break
        case 'isCompleted':
            queryUpdate = { isCompleted: value }
            break
        default:
            break
    }
    return Job.findByIdAndUpdate(
        jobId,
        queryUpdate, {
        upsert: true,
        new: true
    }
    ).select('title isDeleted isCompleted')
}

module.exports.deleteJob = async (req, res, next) => {
    const jobId = req.params.jobId
    try {
        const job = await setJobStatus({ jobId, status: 'isDeleted', value: 1 })

        if (!job) throw "Can not find job"

        return res.json({
            message: `Send job ${job.title} to trash successfully!`,
            job
        })
    } catch (error) {
        next(error)
    }
}

module.exports.undoDeleteJob = async (req, res, next) => {
    const jobId = req.params.jobId
    try {
        const job = await setJobStatus({ jobId, status: 'isDeleted', value: 0 })

        if (!job) throw "Can not find job"

        return res.json({
            message: `Restore job ${job.title} successfully!`,
            job
        })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteImmediately = async (req, res, next) => {
    const jobId = req.params.jobId

    try {
        const raw = await Job.deleteOne({
            _id: jobId
        })

        return res.json({
            message: "Delete job successfully!",
            raw
        })
    } catch (error) {
        next(error)
    }
}

module.exports.completedJob = async (req, res, next) => {
    const jobId = req.params.jobId
    try {
        const job = await setJobStatus({
            jobId,
            status: 'isCompleted',
            value: 1
        })

        if (!job) throw "Can not find job"

        return res.json({
            message: `Completed job ${job.title} successfully!`,
            job
        })
    } catch (error) {
        next(error)
    }
}

module.exports.undoCompletedJob = async (req, res, next) => {
    const jobId = req.params.jobId
    try {
        const job = await setJobStatus({
            jobId,
            status: 'isCompleted',
            value: 0
        })

        if (!job) throw "Can not find job"

        return res.json({
            message: `Undo Completed job successfully!`,
            job
        })
    } catch (error) {
        next(error)
    }
}

const getQueryUpdateJob = ({ title, description, isAllowMemberAddMember }) => {
    let query = {
        ...(title && {
            title
        }),
        ...(description && {
            description
        })
    }

    if (isAllowMemberAddMember === 0) {
        query = {
            ...query,
            'allowed.isAllowMemberAddMember': 0
        }
    }

    if (isAllowMemberAddMember === 1) {
        query = {
            ...query,
            'allowed.isAllowMemberAddMember': 1
        }
    }

    return query
}

module.exports.updateJob = async (req, res, next) => {
    const jobId = req.params.jobId
    const {
        title,
        description,
        isAllowMemberAddMember
    } = req.body
    try {
        const query = getQueryUpdateJob({
            title,
            description,
            isAllowMemberAddMember
        })

        const job = await Job.findByIdAndUpdate(
            jobId,
            query, {
            new: true
        }
        )

        if (!job) throw "Can not find job"

        return res.json({
            message: `Update job successfully!`,
            job
        })
    } catch (error) {
        next(error)
    }
}

const getVerifyUsers = (arrayUserIds) => {
    return User.find({
        _id: {
            $in: arrayUserIds
        }
    })
}

const getVerifyUserIds = (userIds) => {
    return getVerifyUsers(userIds)
        .then(verifyUsers => {
            return verifyUsers.map(user => user._id)
        })
}

const splitUserIds = (userIds) => {
    if (typeof userIds === 'string') {
        return userIds.split(',').map(item => {
            return item.trim()
        })
    } else {
        return userIds
    }
}

const pushJobToUsers = ({ jobId, userIds, session }) => {
    return User.updateMany({
        _id: {
            $in: userIds
        },
        "jobs._id": {
            $ne: jobId
        }
    }, {
        $push: {
            jobs: {
                _id: jobId,
                role: "user",
                isJoined: 0
            }
        }
    }).session(session)
}

const createNotifyJoinJob = ({
    message,
    jobId,
    userIds,
    session
}) => {
    let arrayNotifyCreate = []
    for (let index = 0; index < userIds.length; index++) {
        arrayNotifyCreate.push({
            title: INVITE_JOIN_JOB,
            message: message,
            secretKey: {
                jobId
            },
            user: userIds[index]
        })
    }

    return Notify.create(arrayNotifyCreate, {
        session
    })
}

const isAllowed = ({ job, idCheck, userCheck }) => {
    if (!job.allowed.isAllowMemberAddMember && userCheck.jobs.some(item => {
        return item._id.equals(idCheck) && item.role === 'user'
    })) {
        return false
    }
    return true
}

module.exports.addMembers = async (req, res, next) => {
    const userIds = req.body.userIds
    const jobId = req.params.jobId
    const signedUser = req.user
    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const arrayUserIds = splitUserIds(userIds)

            // Verify job and users will add to job
            const [job, verifyUserIds] = await Promise.all([
                Job.findById(jobId),
                getVerifyUserIds(arrayUserIds)
            ])

            if (verifyUserIds.length === 0) throw 'Can not find any user"'

            if (!isAllowed({
                job,
                idCheck: jobId,
                userCheck: signedUser
            })) {
                throw 'Member can not add member'
            }

            await Promise.all([
                pushJobToUsers({
                    jobId,
                    userIds: verifyUserIds,
                    session
                }),
                createNotifyJoinJob({
                    message: `${signedUser.name} invite you join job ${job.title}`,
                    jobId,
                    userIds: arrayUserIds,
                    session
                })
            ])

            return res.json({
                message: `Add member successfully!`,
            })
        })
    } catch (error) {
        next(error)
    }
}

module.exports.agreeJoinJob = async (req, res, next) => {
    const jobId = req.params.jobId
    const signedUser = req.user
    try {
        await Promise.all([
            User.updateOne({
                _id: signedUser._id,
                'jobs._id': jobId
            }, {
                $set: {
                    'jobs.$.isJoined': 1
                }
            }),

            Notify.updateOne({
                user: signedUser._id,
                title: INVITE_JOIN_JOB,
                'secretKey.jobId': jobId
            }, {
                $unset: {
                    secretKey: {
                        jobId
                    }
                },
                isAction: 1
            })
        ])

        return res.json({
            message: 'Join job successfully!'
        })
    } catch (error) {
        next(error)
    }
}

module.exports.disAgreeJoinJob = async (req, res, next) => {
    const jobId = req.params.jobId
    const signedUser = req.user
    try {
        await Promise.all([
            User.updateOne({
                _id: signedUser._id,
                'jobs._id': jobId
            }, {
                $pull: {
                    jobs: {
                        _id: jobId
                    }
                }
            }),

            Notify.updateOne({
                user: signedUser._id,
                title: INVITE_JOIN_JOB,
                'secretKey.jobId': jobId
            }, {
                $unset: {
                    secretKey: {
                        jobId
                    }
                },
                isAction: 1
            })
        ])

        return res.json({
            message: 'Disagree join job successfully!'
        })
    } catch (error) {
        next(error)
    }
}

module.exports.removeMembers = async (req, res, next) => {
    const userIds = req.body.userIds
    const { jobId } = req.params
    try {
        const arrayUserIds = splitUserIds(userIds)

        await Promise.all([
            User.updateMany({
                _id: {
                    $in: arrayUserIds
                }
            }, {
                $unset: {
                    jobs: {
                        _id: jobId
                    }
                }
            })
        ])

        return res.json({
            message: `Remove member successfully!`
        })

    } catch (error) {
        next(error)
    }
}

module.exports.leaveJob = async (req, res, next) => {
    const { jobId } = req.params
    const signedUser = req.user
    try {
        await User.updateOne({
            _id: signedUser._id
        }, {
            $unset: {
                jobs: {
                    _id: jobId
                }
            }
        })

        return res.json({
            message: `Leave project successfully!`,
        })
    } catch (error) {
        next(error)
    }
}

module.exports.changeUserRole = async (req, res, next) => {
    const jobId = req.params.jobId
    const { userId, role } = req.body
    try {
        const user = await Promise.all([
            User.findOneAndUpdate({
                _id: userId
            }, {
                $set: {
                    "jobs.$[element].role": role
                }
            }, {
                arrayFilters: [{
                    'element._id': jobId
                }],
                new: true
            })
        ])

        if (!user) throw "Can not find user or user not a member in job"

        return res.json({
            message: `${user.name} is now ${role}!`,
        })
    } catch (error) {
        next(error)
    }
}