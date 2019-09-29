const isAllowed = (roleCheck, rolesAllowed) => {
    return rolesAllowed.indexOf(roleCheck) > -1
}

const isInUser = (allowed) => {
    if (allowed.indexOf("user") > -1 || allowed.indexOf("self") > -1) {
        allowed += ' admin'
    }

    return (req) => {
        // Action in user's self, like update user
        if (isAllowed('self', allowed)
            && req.params.userId
            && req.user._id.equals(req.params.userId)) {
            return true
        }

        if (req.user && isAllowed(req.user.role, allowed)) return true
        else return false
    }
}

const isInProject = (allowed, compareFrom) => {
    if (allowed.indexOf("admin") > -1) {
        allowed += ' owner'
    }

    if (allowed.indexOf("user") > -1) {
        allowed += ' admin owner'
    }

    return (req) => {
        const signedUser = req.user
        let projectId
        switch (compareFrom) {
            case "body":
                projectId = req.body.projectId
                break;
            case "params":
                projectId = req.params.projectId
                break;
            case "query":
                projectId = req.query.projectId
                break;
            default:
                return false
        }

        if (signedUser && signedUser.projects
            && signedUser.projects.some(project => {
                return project._id.equals(projectId)
                    && isAllowed(project.role, allowed)
            }))
            return true

        return false
    }
}

module.exports = checkPermit = (...checks) => {
    return (req, res, next) => {
        for (let i = 0; i < checks.length; i++) {
            const { model, role, source } = checks[i]
            switch (model) {
                case 'user':
                    if (isInUser(role)(req)) return next()
                case 'project':
                    if (isInProject(role, source)(req)) return next()
                default:
                    break
            }
        }

        return res.status(403).json({
            message: "You don't have authorization to do this action!"
        })
    }
}
