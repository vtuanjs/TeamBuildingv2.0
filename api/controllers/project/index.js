'use strict'
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
        title,
        description,
        isAllowMemberAddMember,
    } = req.body
    const signedUser = req.user
    try {
        const project = await Project.create({
            title,
            description,
            allowed: {
                isAllowMemberAddMember,
            },
            members: [signedUser._id]
        })

        await pushProjectToUser(project._id, signedUser)

        return res.json({
            message: `Create project successfully!`,
            project
        })
    } catch (error) {
        next(error)
    }
}

const setProjectStatus = ({ projectId, status, value }) => {
    let queryUpdate
    switch (status) {
        case 'isDeleted':
            queryUpdate = {
                isDeleted: value
            }
            break
        case 'isStored':
            queryUpdate = {
                isStored: value
            }
            break
        default:
            return false
    }

    return Project.findByIdAndUpdate(
        projectId,
        queryUpdate, {
        upsert: true,
        new: true
    }
    ).select('title isDeleted isStored')
}

module.exports.deleteProject = async (req, res, next) => {
    const projectId = req.params.projectId
    try {
        const project = await setProjectStatus({
            projectId,
            status: 'isDeleted',
            value: 1
        })

        if (!project) throw "Can not find project"

        return res.json({
            message: `Send project ${project.title} to trash successfully!`,
            project
        })
    } catch (error) {
        next(error)
    }
}

module.exports.undoDeleteProject = async (req, res, next) => {
    const projectId = req.params.projectId
    try {
        const project = await setProjectStatus({
            projectId,
            status: 'isDeleted',
            value: 0
        })

        if (!project) throw "Can not find project"

        return res.json({
            message: `Restore project ${project.title} successfully!`,
            project
        })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteImmediately = async (req, res, next) => {
    const projectId = req.params.projectId

    try {
        const raw = await Project.deleteOne({
            _id: projectId
        })

        return res.json({
            message: "Delete project successfully!",
            raw
        })
    } catch (error) {
        next(error)
    }
}

module.exports.storedProject = async (req, res, next) => {
    const projectId = req.params.projectId
    try {
        const project = await setProjectStatus({
            projectId,
            status: 'isStored',
            value: 1
        })

        if (!project) throw "Can not find project"

        return res.json({
            message: `Stored project ${project.title} successfully!`,
            project
        })
    } catch (error) {
        next(error)
    }
}

module.exports.undoStoredProject = async (req, res, next) => {
    const projectId = req.params.projectId
    try {
        const project = await await setProjectStatus({
            projectId,
            status: 'isStored',
            value: 0
        })

        if (!project) throw "Can not find project"

        return res.json({
            message: `Undo Stored project successfully!`,
            project
        })
    } catch (error) {
        next(error)
    }
}

const getQueryUpdateProject = ({ title, description, isAllowMemberAddMember }) => {
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

module.exports.updateProject = async (req, res, next) => {
    const projectId = req.params.projectId
    const {
        title,
        description,
        isAllowMemberAddMember,
    } = req.body
    try {

        const query = getQueryUpdateProject({
            title,
            description,
            isAllowMemberAddMember
        })

        const project = await Project.findByIdAndUpdate(
            projectId,
            query, {
            new: true
        }
        )

        if (!project) throw "Can not find project"

        return res.json({
            message: `Update project successfully!`,
            project
        })
    } catch (error) {
        next(error)
    }
}

const queryGetProjects = (byUser, filter) => {
    let query = {
        members: {
            $in: [byUser._id]
        }
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
            default:
                break
        }
    }

    return query
}

module.exports.getProjects = async (req, res, next) => {
    const filter = req.query.filter
    const signedUser = req.user

    try {
        const projects = await Project.find(
            queryGetProjects(signedUser, filter),
            "title createdAt"
        )

        if (!projects) throw "Can not show project"

        return res.json({
            projects
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getProject = async (req, res, next) => {
    const projectId = req.params.projectId

    try {
        const project = await Project.findById(projectId)

        if (!project) throw "Wrong project id"

        return res.json({
            project
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

const addMembersToProject = ({
    projectId,
    userIds,
    session
}) => {
    return Project.findByIdAndUpdate(
        projectId, {
        $addToSet: {
            members: {
                $each: userIds
            }
        }
    }, {
        new: true
    }).select('members').session(session)
}

const pushProjectToUsers = ({
    projectId,
    userIds,
    session
}) => {
    return User.updateMany({
        _id: {
            $in: userIds
        },
        "projects._id": {
            $ne: projectId
        }
    }, {
        $push: {
            projects: {
                _id: projectId,
                role: "user",
                isJoined: 0
            }
        }
    }).session(session)
}

const createNotifyJoinProject = ({
    message,
    projectId,
    userIds,
    session
}) => {
    let arrayNotifyCreate = []
    for (let index = 0; index < userIds.length; index++) {
        arrayNotifyCreate.push({
            title: INVITE_JOIN_PROJECT,
            message: message,
            secretKey: {
                projectId
            },
            user: userIds[index]
        })
    }

    return Notify.create(arrayNotifyCreate, {
        session
    })
}

const isAllowed = ({ project, idCheck, userCheck }) => {
    if (!project.allowed.isAllowMemberAddMember && userCheck.projects.some(item => {
        return item._id.equals(idCheck) && item.role === 'user'
    })) {
        return false
    }
    return true
}

module.exports.addMembers = async (req, res, next) => {
    const userIds = req.body.userIds
    const projectId = req.params.projectId
    const signedUser = req.user
    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const arrayUserIds = splitUserIds(userIds)

            // Verify project and users will add to project
            const [project, verifyUserIds] = await Promise.all([
                Project.findById(projectId),
                getVerifyUserIds(arrayUserIds)
            ])

            if (verifyUserIds.length === 0) throw 'Can not find any user"'

            if (!isAllowed({
                project,
                idCheck: projectId,
                userCheck: signedUser
            })) {
                throw 'Member can not add member'
            }

            const [projectWillAddMembers, ,] = await Promise.all([
                addMembersToProject({
                    projectId,
                    userIds: verifyUserIds,
                    session
                }),
                pushProjectToUsers({
                    projectId,
                    userIds: verifyUserIds,
                    session
                }),
                createNotifyJoinProject({
                    message: `${signedUser.name} invite you join project ${project.title}`,
                    projectId,
                    userIds: arrayUserIds,
                    session
                })
            ])

            return res.json({
                message: `Add member successfully!`,
                project: projectWillAddMembers
            })
        })
    } catch (error) {
        next(error)
    }
}

module.exports.agreeJoinProject = async (req, res, next) => {
    const projectId = req.params.projectId
    const signedUser = req.user
    try {
        await Promise.all([
            User.updateOne({
                _id: signedUser._id,
                'projects._id': projectId
            }, {
                $set: {
                    'projects.$.isJoined': 1
                }
            }),

            Notify.updateOne({
                user: signedUser._id,
                title: INVITE_JOIN_PROJECT,
                'secretKey.projectId': projectId
            }, {
                $unset: {
                    secretKey: {
                        projectId
                    }
                },
                isAction: 1
            })
        ])

        return res.json({
            message: 'Join project successfully!'
        })
    } catch (error) {
        next(error)
    }
}

module.exports.disAgreeJoinProject = async (req, res, next) => {
    const projectId = req.params.projectId
    const signedUser = req.user
    try {
        await Promise.all([
            User.updateOne({
                _id: signedUser._id,
                'projects._id': projectId
            }, {
                $pull: {
                    projects: {
                        _id: projectId
                    }
                }
            }),

            Project.updateOne({
                _id: projectId
            }, {
                $pull: {
                    members: signedUser._id
                }
            }),

            Notify.updateOne({
                user: signedUser._id,
                title: INVITE_JOIN_PROJECT,
                'secretKey.projectId': projectId
            }, {
                $unset: {
                    secretKey: {
                        projectId
                    }
                },
                isAction: 1
            })
        ])

        return res.json({
            message: 'Disagree join project successfully!'
        })
    } catch (error) {
        next(error)
    }
}


module.exports.removeMembers = async (req, res, next) => {
    const userIds = req.body.userIds
    const {
        projectId
    } = req.params

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {

            const arrayUserIds = splitUserIds(userIds)

            const [project,] = await Promise.all([
                Project.findByIdAndUpdate(
                    projectId, {
                    $pullAll: {
                        members: arrayUserIds
                    }
                }, {
                    new: true
                }
                ).session(session),

                User.updateMany({
                    _id: {
                        $in: arrayUserIds
                    }
                }, {
                    $unset: {
                        projects: {
                            _id: projectId
                        }
                    }
                }).session(session)
            ])

            if (!project)
                throw "Can not find project"

            return res.json({
                message: `Remove member successfully!`,
                project
            })
        })
    } catch (error) {
        next(error)
    }
}

module.exports.changeUserRole = async (req, res, next) => {
    const projectId = req.params.projectId
    const {
        userId,
        role
    } = req.body

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const [project, user] = await Promise.all([
                Project.findById(projectId),
                User.findOneAndUpdate({
                    _id: userId
                }, {
                    $set: {
                        "projects.$[element].role": role
                    }
                }, {
                    arrayFilters: [{
                        'element._id': projectId
                    }],
                    new: true
                }).session(session)
            ])

            if (!user || !project) throw "Can not find user/project or user not a member in project"

            return res.json({
                message: `${user.name} is now ${role}!`,
                user: {
                    _id: user._id,
                    projects: user.projects
                }
            })
        })
    } catch (error) {
        next(error)
    }
}