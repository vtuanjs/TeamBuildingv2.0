const Project = require('./project.model')
const User = require('../user/user.model')
const Notify = require('../notify/notify.model')
const mongoose = require('mongoose')
const INVITE_JOIN_PROJECT = 'Invite Join Project'

module.exports.postProject = async (req, res, next) => {
    const {
        title, description, isAllowMemberAddMember, isAllowMemberCreateJob
    } = req.body
    const signedUser = req.user
    try {
        const project = await Project.create(
            {
                title,
                description,
                allowed: {
                    isAllowMemberAddMember,
                    isAllowMemberCreateJob,
                },
                members: [signedUser._id]
            }
        )

        signedUser.projects.push({
            _id: project._id,
            role: "owner"
        })
        await signedUser.save()

        res.json({ message: `Create project successfully!`, project })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteProject = async (req, res, next) => {
    const {
        projectId
    } = req.params
    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            { isDeleted: 1 },
            {
                upsert: true,
                new: true
            }
        ).select('title isDeleted')

        if (!project) throw "Can not find project"

        res.json({ message: `Send project ${project.title} to trash successfully!`, project })
    } catch (error) {
        next(error)
    }
}

module.exports.undoDeleteProject = async (req, res, next) => {
    const { projectId } = req.params
    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            { isDeleted: 0 },
            {
                upsert: true, new: true
            }
        ).select('isDeleted')

        if (!project) throw "Can not find project"

        res.json({ message: `Restore project ${project.title} successfully!`, project })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteImmediately = async (req, res, next) => {
    const { projectId } = req.params

    try {
        const raw = await Project.deleteOne(
            { _id: projectId }
        )

        res.json({ message: "Delete project successfully!", raw })
    } catch (error) {
        next(error)
    }
}

module.exports.storedProject = async (req, res, next) => {
    const { projectId } = req.params
    try {
        const project = await Project.findByIdAndUpdate(
            projectId, { isStored: 1 },
            { upsert: true, new: true }
        ).select('title isStored')

        if (!project) throw "Can not find project"

        res.json({ message: `Stored project ${project.title} successfully!`, project })
    } catch (error) {
        next(error)
    }
}

module.exports.undoStoredProject = async (req, res, next) => {
    const { projectId } = req.params
    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            { isStored: 0 },
            { upsert: true, new: true }
        ).select('title isStored')

        if (!project) throw "Can not find project"

        res.json({ message: `Undo Stored project successfully!`, project })
    } catch (error) {
        next(error)
    }
}

module.exports.updateProject = async (req, res, next) => {
    const { projectId } = req.params
    const { title, description } = req.body

    const query = {
        ...(title && { title }),
        ...(description && { description }),
    }
    try {
        const project = await Project.findByIdAndUpdate(
            projectId, query, { new: true }
        )

        if (!project) throw "Can not find project"

        res.json({ message: `Update project successfully!`, project })
    } catch (error) {
        next(error)
    }
}

module.exports.getProjects = async (req, res, next) => {
    const { filter } = req.query
    const signedUser = req.user
    let condition = {
        members: { $in: [signedUser._id] }
    }

    if (!filter) {
        condition = {
            ...condition,
            isStored: 0,
            isDeleted: 0
        }
    }

    if (filter) {
        switch (filter) {
            case 'isStored':
                condition = {
                    ...condition,
                    isStored: 1
                }
                break
            case 'isDeleted':
                condition = {
                    ...condition,
                    isDeleted: 1
                }
                break
            default: break
        }
    }

    try {
        const projects = await Project.find(
            condition,
            "title createdAt"
        )

        if (!projects) throw "Can not show project"

        res.json({ projects })
    } catch (error) {
        next(error)
    }
}

module.exports.getProject = async (req, res, next) => {
    const { projectId } = req.params

    try {
        const project = await Project.findById(projectId)

        if (!project) throw "Wrong project id"

        res.json({ project })
    } catch (error) {
        next(error)
    }
}

const findUserWithPopulateProject = (userId) => {
    return User
        .findById(userId)
        .populate('projects._id', 'title')
}

const convertUserIdsFromStringToArray = (userIds) => {
    if (typeof userIds === 'string') {
        return userIds.split(',').map(item => {
            return item.trim()
        })
    } else {
        return userIds
    }
}

const createNotifyJoinProjectToUsers = (message, secretKey, userIds, session) => {
    let arrayNotifyCreate = []
    for (let index = 0; index < userIds.length; index++) {
        arrayNotifyCreate.push({
            title: INVITE_JOIN_PROJECT,
            message: message,
            secretKey,
            user: userIds[index]
        })
    }

    return Notify.create(arrayNotifyCreate, { session })
}

module.exports.addMembers = async (req, res, next) => {
    const { userIds } = req.body
    const { projectId } = req.params
    const signedUser = req.user
    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const arrayUserIds = convertUserIdsFromStringToArray(userIds)

            const [populateUser, verifyUsers] = await Promise.all([
                findUserWithPopulateProject(signedUser._id),
                User.find({ _id: { $in: arrayUserIds } })
            ])

            const findProjectInUser = populateUser.projects.find(
                project => project._id.equals(projectId)
            )
            const verifyUserIds = verifyUsers.map(user => user._id)

            if (!findProjectInUser) throw 'User is not in project'
            if (verifyUsers.length === 0) throw "Can not find any user"

            const [projectWillAddMembers, _user, _notify] = await Promise.all([
                Project.findOneAndUpdate(
                    { _id: projectId },
                    { $addToSet: { members: { $each: verifyUserIds } } },
                    { new: true }
                ).select('members').session(session),

                User.updateMany(
                    {
                        _id: { $in: verifyUserIds },
                        "projects._id": { $ne: projectId }
                    },
                    {
                        $push: {
                            projects: {
                                _id: projectId,
                                role: "user",
                                isJoined: 0
                            }
                        }
                    }
                ).session(session),

                createNotifyJoinProjectToUsers(
                    `${signedUser.name} invite you join project ${findProjectInUser._id.title}`,
                    projectId,
                    arrayUserIds,
                    session
                )
            ])

            if (!projectWillAddMembers)
                throw "Can not find project"

            // Check permistion
            if (!projectWillAddMembers.allowed.isAllowMemberAddMember
                && findProjectInUser._id.role === 'user')
                throw 'Member can not add member'

            return res.json({
                message: `Add member successfully!`, project: projectWillAddMembers
            })
        })
    } catch (error) {
        next(error)
    }
}

module.exports.agreeJoinProject = async (req, res, next) => {
    const { projectId } = req.query
    const signedUser = req.user
    try {
        await Promise.all([
            User.updateOne(
                { _id: signedUser._id, 'projects._id': projectId },
                { $set: { 'projects.$.isJoined': 1 } }
            ),

            Notify.updateOne(
                { user: signedUser._id, title: INVITE_JOIN_PROJECT, secretKey: projectId },
                { $unset: { secretKey: projectId }, isAction: 1 }
            )
        ])

        res.json({ message: 'Join project successfully!' })
    } catch (error) {
        next(error)
    }
}

module.exports.disAgreeJoinProject = async (req, res, next) => {
    const { projectId } = req.query
    const signedUser = req.user
    try {
        await Promise.all([
            User.updateOne(
                { _id: signedUser._id, 'projects._id': projectId },
                {
                    $pull: { projects: { 'projects._id': projectId } }
                }
            ),

            Project.findByIdAndUpdate(
                projectId,
                { $pull: { members: signedUser._id } }
            ),

            Notify.updateOne(
                {
                    user: signedUser._id,
                    title: INVITE_JOIN_PROJECT,
                    secretKey: projectId
                },
                {
                    $unset: { secretKey: projectId },
                    isAction: 1
                }
            )
        ])

        res.json({ message: 'Disagree join project successfully!' })
    } catch (error) {
        next(error)
    }
}


module.exports.removeMembers = async (req, res, next) => {
    const { userIds } = req.body
    const { projectId } = req.params

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {

            let arrayUserIds = convertUserIdsFromStringToArray(userIds)

            const [project, _user] = await Promise.all([
                Project.findByIdAndUpdate(
                    projectId,
                    {
                        $pullAll: { members: arrayUserIds }
                    },
                    { new: true }
                ).session(session),

                User.updateMany(
                    { _id: { $in: arrayUserIds } },
                    { $unset: { "projects._id": projectId } }
                ).session(session)
            ])

            if (!project)
                throw "Can not find project"

            return res.json({ message: `Remove member successfully!`, project })
        })
    } catch (error) {
        next(error)
    }
}

module.exports.changeUserRole = async (req, res, next) => {
    const { projectId } = req.params
    const { userId, role } = req.body

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const [project, user] = await Promise.all([
                Project.findById(projectId),
                User.findOneAndUpdate(
                    { _id: userId, "projects._id": projectId },
                    { $set: { "projects.$.role": role } },
                    { new: true }
                ).session(session)
            ])

            if (!user || !project) throw "Can not find user/project or user not a member in project"

            res.json({
                message: `${user.title} is now ${role}!`, user: { _id: user._id, projects: user.projects }
            })
        })
    } catch (error) {
        next(error)
    }
}