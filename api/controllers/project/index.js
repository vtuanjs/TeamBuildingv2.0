const Project = require('./project.model')
const User = require('../user/user.model')
const Notify = require('../notify/notify.model')
const mongoose = require('mongoose')
const INVITE_JOIN_PROJECT = 'Invite Join Project'

const pushProjectToUser = (projectId, user) => {
    user.projects.push({
        _id: projectId,
        role: "owner"
    })

    return user.save()
}

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

        await pushProjectToUser(project._id, signedUser)

        res.json({ message: `Create project successfully!`, project })
    } catch (error) {
        next(error)
    }
}

const setIsDeletedStatus = (projectId, status) => {
    return Project.findByIdAndUpdate(
        projectId,
        { isDeleted: status },
        {
            upsert: true,
            new: true
        }
    ).select('title isDeleted')
}

module.exports.deleteProject = async (req, res, next) => {
    const { projectId } = req.params
    try {
        const project = await setIsDeletedStatus(projectId, 1)

        if (!project) throw "Can not find project"

        res.json({ message: `Send project ${project.title} to trash successfully!`, project })
    } catch (error) {
        next(error)
    }
}

module.exports.undoDeleteProject = async (req, res, next) => {
    const { projectId } = req.params
    try {
        const project = await setIsDeletedStatus(projectId, 0)

        if (!project) throw "Can not find project"

        res.json({ message: `Restore project ${project.title} successfully!`, project })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteImmediately = async (req, res, next) => {
    const { projectId } = req.params

    try {
        const raw = await Project.deleteOne({ _id: projectId })

        res.json({ message: "Delete project successfully!", raw })
    } catch (error) {
        next(error)
    }
}

const setIsStoredStatus = (projectId, status) => {
    return Project.findByIdAndUpdate(
        projectId, { isStored: status },
        { upsert: true, new: true }
    ).select('title isStored')
}

module.exports.storedProject = async (req, res, next) => {
    const { projectId } = req.params
    try {
        const project = await setIsStoredStatus(projectId, 1)

        if (!project) throw "Can not find project"

        res.json({ message: `Stored project ${project.title} successfully!`, project })
    } catch (error) {
        next(error)
    }
}

module.exports.undoStoredProject = async (req, res, next) => {
    const { projectId } = req.params
    try {
        const project = await setIsStoredStatus(projectId, 0)

        if (!project) throw "Can not find project"

        res.json({ message: `Undo Stored project successfully!`, project })
    } catch (error) {
        next(error)
    }
}

module.exports.updateProject = async (req, res, next) => {
    const { projectId } = req.params
    const { title, description } = req.body

    try {
        const project = await Project.findByIdAndUpdate(
            projectId,
            {
                ...(title && { title }),
                ...(description && { description }),
            },
            { new: true }
        )

        if (!project) throw "Can not find project"

        res.json({ message: `Update project successfully!`, project })
    } catch (error) {
        next(error)
    }
}

const queryGetProjects = (byUser, filter) => {
    let query = {
        members: { $in: [byUser._id] }
    }

    if (!filter) {
        query = {
            ...query,
            isStored: 0,
            isDeleted: 0
        }
    }

    if (filter) {
        switch (filter) {
            case 'isStored':
                query = {
                    ...query,
                    isStored: 1
                }
                break
            case 'isDeleted':
                query = {
                    ...query,
                    isDeleted: 1
                }
                break
            default: break
        }
    }

    return query
}

module.exports.getProjects = async (req, res, next) => {
    const { filter } = req.query
    const signedUser = req.user

    try {
        const projects = await Project.find(
            queryGetProjects(signedUser, filter),
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

const populateProjectInUser = (userId) => {
    return User
        .findById(userId)
        .populate('projects._id', 'title')
}

const getVerifyUsers = (arrayUserIds) => {
    return User.find({ _id: { $in: arrayUserIds } })
}


const getProjectPropertyInUser = (user, projectId) => {
    return user.projects.find(
        project => project._id.equals(projectId)
    )
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

const setMembersInProject = ({ projectId, userIds, session }) => {
    return Project.findOneAndUpdate(
        { _id: projectId },
        { $addToSet: { members: { $each: userIds } } },
        { new: true }
    ).select('members').session(session)
}

const pushProjectToUsers = ({ projectId, userIds, session }) => {
    return User.updateMany(
        {
            _id: { $in: userIds },
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
    ).session(session)
}

const createNotifyJoinProject = ({ message, projectId, userIds, session }) => {
    let arrayNotifyCreate = []
    for (let index = 0; index < userIds.length; index++) {
        arrayNotifyCreate.push({
            title: INVITE_JOIN_PROJECT,
            message: message,
            secretKey: { projectId },
            user: userIds[index]
        })
    }

    return Notify.create(arrayNotifyCreate, { session })
}

const isAllowed = (project, role) => {
    if (!project.allowed.isAllowMemberAddMember
        && role === 'user')
        return false

    return true
}

module.exports.addMembers = async (req, res, next) => {
    const { userIds } = req.body
    const { projectId } = req.params
    const signedUser = req.user
    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const arrayUserIds = splitUserIds(userIds)

            const [populateUser, verifyUsers] = await Promise.all([
                populateProjectInUser(signedUser._id),
                getVerifyUsers(arrayUserIds)
            ])

            const projectInUser = getProjectPropertyInUser(populateUser, projectId)
            const verifyUserIds = verifyUsers.map(user => user._id)

            if (!projectInUser) throw 'User is not in project'
            if (verifyUsers.length === 0) throw "Can not find any user"

            const [projectWillAddMembers, ,] = await Promise.all([
                setMembersInProject({ projectId, userIds: verifyUserIds, session }),
                pushProjectToUsers({ projectId, userIds: verifyUserIds, session }),
                createNotifyJoinProject({
                    message: `${signedUser.name} invite you join project ${projectInUser._id.title}`,
                    projectId,
                    userIds: arrayUserIds,
                    session
                })
            ])

            if (!projectWillAddMembers)
                throw "Can not find project"

            if (!isAllowed(projectWillAddMembers, projectInUser.role))
                throw 'Member can not add member'

            res.json({
                message: `Add member successfully!`, project: projectWillAddMembers
            })
        })
    } catch (error) {
        next(error)
    }
}

module.exports.agreeJoinProject = async (req, res, next) => {
    const { projectId } = req.params
    const signedUser = req.user
    try {
        await Promise.all([
            User.updateOne(
                { _id: signedUser._id, 'projects._id': projectId },
                { $set: { 'projects.$.isJoined': 1 } }
            ),

            Notify.updateOne(
                { user: signedUser._id, title: INVITE_JOIN_PROJECT, 'secretKey.projectId': projectId },
                { $unset: { secretKey: { projectId } }, isAction: 1 }
            )
        ])

        res.json({ message: 'Join project successfully!' })
    } catch (error) {
        next(error)
    }
}

module.exports.disAgreeJoinProject = async (req, res, next) => {
    const { projectId } = req.params
    const signedUser = req.user
    try {
        await Promise.all([
            User.updateOne(
                { _id: signedUser._id, 'projects._id': projectId },
                { $pull: { projects: { _id: projectId } } }
            ),

            Project.updateOne(
                { _id: projectId },
                { $pull: { members: signedUser._id } }
            ),

            Notify.updateOne(
                {
                    user: signedUser._id,
                    title: INVITE_JOIN_PROJECT,
                    'secretKey.projectId': projectId
                },
                {
                    $unset: { secretKey: { projectId } },
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

            let arrayUserIds = splitUserIds(userIds)

            const [project,] = await Promise.all([
                Project.findByIdAndUpdate(
                    projectId,
                    {
                        $pullAll: { members: arrayUserIds }
                    },
                    { new: true }
                ).session(session),

                User.updateMany(
                    { _id: { $in: arrayUserIds } },
                    { $unset: { projects: { _id: projectId } } }
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
                    { _id: userId },
                    { $set: { "projects.$[element].role": role } },
                    {
                        arrayFilters: [{ 'element._id': projectId }],
                        new: true
                    }
                ).session(session)
            ])

            if (!user || !project) throw "Can not find user/project or user not a member in project"

            res.json({
                // project, user
                message: `${user.name} is now ${role}!`, user: { _id: user._id, projects: user.projects }
            })
        })
    } catch (error) {
        next(error)
    }
}