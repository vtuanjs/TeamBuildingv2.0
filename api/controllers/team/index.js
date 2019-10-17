const Team = require('./team.model')
const User = require('../user/user.model')
const Notify = require('../notify/notify.model')
const INVITE_JOIN_TEAM = 'Invite Join Team'
const mongoose = require('mongoose')

module.exports.postTeam = async (req, res, next) => {
    const signedUser = req.user
    const { name, description } = req.body
    try {
        const team = await Team.create({
            name,
            description,
            author: signedUser._id
        })

        await User.findByIdAndUpdate(
            signedUser._id,
            {
                $addToSet: {
                    teams: {
                        _id: team._id,
                        role: 'owner',
                        isJoined: 1
                    }
                }
            }
        )

        return res.json({
            message: `Create team: ${team.name} successfully!`,
            team
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getTeams = async (req, res, next) => {
    try {
        const teams = await Team.find()

        return res.json({
            message: `Get list teams succesfully!`,
            teams
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getTeamsByUser = async (req, res, next) => {
    const signedUser = req.user
    try {
        const arrayTeamIdsOfUser = signedUser.teams.map(team => {
            return team._id
        })
        const teams = await Team.find({
            _id: {
                $in: arrayTeamIdsOfUser
            }
        }).select('name author')

        if (teams.length === 0) {
            throw 'Can not find any team'
        }

        return res.json({
            message: `Get list teams succesfully!`,
            teams
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getDetail = async (req, res, next) => {
    const { teamId } = req.params
    try {
        const [team, members] = await Promise.all([
            Team.findOne({
                _id: teamId
            }).populate('author', 'name'),

            User.find({ 'teams._id': teamId }).select('name')
        ])

        if (!team) {
            throw 'Can not find any team'
        }

        return res.json({
            message: `Get list teams succesfully!`,
            team: {
                detail: team,
                members
            }
        })
    } catch (error) {
        next(error)
    }
}

module.exports.updateTeam = async (req, res, next) => {
    const { teamId } = req.params
    const { name, description } = req.body
    try {
        const team = await Team.findByIdAndUpdate(teamId, {
            ...(name && { name }),
            ...(description && { description })
        }, {
            new: true
        })

        if (!team) {
            throw 'Can not find this team'
        }

        return res.json({
            message: `Update team successfully!`,
            team
        })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteTeam = async (req, res, next) => {
    const teamId = req.params.teamId

    try {
        const raw = await Team.deleteOne({
            _id: teamId
        })

        return res.json({
            message: "Delete team successfully!",
            raw
        })
    } catch (error) {
        next(error)
    }
}

// Add member function
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

const pushTeamToUsers = ({ teamId, userIds, session }) => {
    return User.updateMany({
        _id: {
            $in: userIds
        },
        "teams._id": {
            $ne: teamId
        }
    }, {
        $push: {
            teams: {
                _id: teamId,
                role: "user",
                isJoined: 0
            }
        }
    }).session(session)
}

const createNotifyJoinTeam = ({
    message,
    teamId,
    userIds,
    session
}) => {
    let arrayNotifyCreate = []
    for (let index = 0; index < userIds.length; index++) {
        arrayNotifyCreate.push({
            title: INVITE_JOIN_TEAM,
            message: message,
            secretKey: {
                teamId
            },
            user: userIds[index]
        })
    }

    return Notify.create(arrayNotifyCreate, {
        session
    })
}

const isAllowed = ({ team, idCheck, userCheck }) => {
    if (!team.allowed.isAllowMemberAddMember && userCheck.teams.some(item => {
        return item._id.equals(idCheck) && item.role === 'user'
    })) {
        return false
    }
    return true
}

module.exports.addMembers = async (req, res, next) => {
    const userIds = req.body.userIds
    const teamId = req.params.teamId
    const signedUser = req.user
    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const arrayUserIds = splitUserIds(userIds)

            // Verify team and users will add to team
            const [team, verifyUserIds] = await Promise.all([
                Team.findById(teamId),
                getVerifyUserIds(arrayUserIds)
            ])

            if (verifyUserIds.length === 0) throw 'Can not find any user"'

            if (!isAllowed({
                team,
                idCheck: teamId,
                userCheck: signedUser
            })) {
                throw 'Member can not add member'
            }

            await Promise.all([
                pushTeamToUsers({
                    teamId,
                    userIds: verifyUserIds,
                    session
                }),
                createNotifyJoinTeam({
                    message: `${signedUser.name} invite you join team ${team.title}`,
                    teamId,
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

module.exports.agreeJoinTeam = async (req, res, next) => {
    const teamId = req.params.teamId
    const signedUser = req.user
    try {
        await Promise.all([
            User.updateOne({
                _id: signedUser._id,
                'teams._id': teamId
            }, {
                $set: {
                    'teams.$.isJoined': 1
                }
            }),

            Notify.updateOne({
                user: signedUser._id,
                title: INVITE_JOIN_TEAM,
                'secretKey.teamId': teamId
            }, {
                $unset: {
                    secretKey: {
                        teamId
                    }
                },
                isAction: 1
            })
        ])

        return res.json({
            message: 'Join team successfully!'
        })
    } catch (error) {
        next(error)
    }
}

module.exports.disAgreeJoinTeam = async (req, res, next) => {
    const teamId = req.params.teamId
    const signedUser = req.user
    try {
        await Promise.all([
            User.updateOne({
                _id: signedUser._id,
                'teams._id': teamId
            }, {
                $pull: {
                    teams: {
                        _id: teamId
                    }
                }
            }),

            Notify.updateOne({
                user: signedUser._id,
                title: INVITE_JOIN_TEAM,
                'secretKey.teamId': teamId
            }, {
                $unset: {
                    secretKey: {
                        teamId
                    }
                },
                isAction: 1
            })
        ])

        return res.json({
            message: 'Disagree join team successfully!'
        })
    } catch (error) {
        next(error)
    }
}

module.exports.removeMembers = async (req, res, next) => {
    const userIds = req.body.userIds
    const { teamId } = req.params
    try {
        const arrayUserIds = splitUserIds(userIds)

        await Promise.all([
            User.updateMany({
                _id: {
                    $in: arrayUserIds
                }
            }, {
                $unset: {
                    teams: {
                        _id: teamId
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

module.exports.leaveTeam = async (req, res, next) => {
    const { teamId } = req.params
    const signedUser = req.user
    try {
        await User.updateOne({
            _id: signedUser._id
        }, {
            $unset: {
                teams: {
                    _id: teamId
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

const handleShowMembers = (members, teamId) => {
    return members.map(member => {
        const teams = member.teams.filter(team => {
            return team._id.equals(teamId)
        })

        return {
            _id: member._id,
            name: member._name,
            team: teams[0]
        }
    })
}

module.exports.showMembers = async (req, res, next) => {
    let { teamId } = req.params
    try {
        const members = await User.find({ 'teams._id': teamId })

        if (!members) {
            throw 'Can not find any members'
        }

        return res.json({ members: handleShowMembers(members, teamId) })
    } catch (error) {
        next(error)
    }
}

module.exports.changeUserRole = async (req, res, next) => {
    const teamId = req.params.teamId
    const { userId, role } = req.body
    try {
        const user = await User.findOneAndUpdate({
            _id: userId
        }, {
            $set: {
                "teams.$[element].role": role
            }
        }, {
            arrayFilters: [{
                'element._id': teamId
            }],
            new: true
        })

        if (!user) throw "Can not find user or user not a member in team"

        return res.json({
            message: `${user.name} is now ${role}!`, user
        })
    } catch (error) {
        next(error)
    }
}
