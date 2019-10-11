const isAllowed = (roleCheck, rolesAllowed) => {
    return rolesAllowed.indexOf(roleCheck) > -1
}

const shouldIsSelfUser = (userIdSelf, userIdCompare, allowed) => {
    return isAllowed('self', allowed) && userIdCompare && userIdSelf.equals(userIdCompare)
}

const pushAdminRole = (allowed) => {
    if (allowed.indexOf("admin") > -1) {
        allowed += ' owner'
    }
    if (allowed.indexOf("user") > -1 || allowed.indexOf("self") > -1) {
        allowed += ' admin owner'
    }

    return allowed
}

const isInUser = (allowed) => {
    allowed = pushAdminRole(allowed)

    return (req) => {
        if (shouldIsSelfUser(req.user._id, req.params.userId, allowed)
            || isAllowed(req.user.role, allowed)) {
            return true
        }
        return false
    }
}

const findParameterFromSource = (parameter, source) => {
    return req => {
        switch (source) {
            case "body":
                return req.body[parameter]
            case "params":
                return req.params[parameter]
            case "query":
                return req.query[parameter]
            default:
                return false
        }
    }
}

const shouldIsAllowed = ({ user, propertyInUser, propertyIdCheck, allowed }) => {
    allowed = pushAdminRole(allowed)

    return user[propertyInUser].some(item => {
        return item._id.equals(propertyIdCheck) && isAllowed(item.role, allowed)
    })
}

const isInProject = (allowed, source) => {
    return (req) => {
        const signedUser = req.user
        let projectId = findParameterFromSource('projectId', source)(req)

        if (projectId) {
            if (shouldIsAllowed({
                user: signedUser,
                propertyInUser: 'projects',
                propertyIdCheck: projectId,
                allowed
            })) {
                return true
            }
        }

        return false
    }
}

const isInJob = (allowed, source) => {
    return (req) => {
        const signedUser = req.user
        let jobId = findParameterFromSource('jobId', source)(req)

        if (jobId) {
            if (shouldIsAllowed({
                user: signedUser,
                propertyInUser: 'jobs',
                propertyIdCheck: jobId,
                allowed
            })) {
                return true
            }
        }

        return false
    }
}

const isInTeam = (allowed, source) => {
    return (req) => {
        const signedUser = req.user
        let teamId = findParameterFromSource('teamId', source)(req)

        if (teamId) {
            if (shouldIsAllowed({
                user: signedUser,
                propertyInUser: 'teams',
                propertyIdCheck: teamId,
                allowed
            })) {
                return true
            }
        }

        return false
    }
}

module.exports = checkPermit = (...checks) => {
    return (req, res, next) => {
        for (let i = 0; i < checks.length; i++) {
            const {
                model,
                role,
                source
            } = checks[i]
            switch (model) {
                case 'user':
                    if (isInUser(role)(req)) return next()
                case 'project':
                    if (isInProject(role, source)(req)) return next()
                case 'job':
                    if (isInJob(role, source)(req)) return next()
                case 'team':
                    if (isInTeam(role, source)(req)) return next()
                default:
                    break
            }
        }

        return res.status(403).json({
            message: "You don't have authorization to do this action!"
        })
    }
}