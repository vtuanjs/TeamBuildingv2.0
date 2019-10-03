const isAllowed = (roleCheck, rolesAllowed) => {
    return rolesAllowed.indexOf(roleCheck) > -1
}

const shouldIsSelfUser = (userIdSelf, userIdCompare, allowed) => {
    return isAllowed('self', allowed) && userIdCompare && userIdSelf.equals(userIdCompare)
}

const isInUser = (allowed) => {
    if (allowed.indexOf("user") > -1 || allowed.indexOf("self") > -1) {
        allowed += ' admin'
    }

    return (req) => {
        if (shouldIsSelfUser(req.user._id, req.params.userId, allowed) || isAllowed(req.user.role, allowed)) {
            return true
        }
        return false
    }
}

const findProjectIdFromSource = (req, source) => {
    let projectId
    switch (source) {
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

    return projectId
}

const shouldIsAllowedInProject = ({
    user,
    projectId,
    allowed
}) => {
    return user && user.projects && user.projects.some(project => {
        return project._id.equals(projectId) && isAllowed(project.role, allowed)
    })
}

const isInProject = (allowed, source) => {
    if (allowed.indexOf("admin") > -1) {
        allowed += ' owner'
    }
    if (allowed.indexOf("user") > -1) {
        allowed += ' admin owner'
    }

    return (req) => {
        const signedUser = req.user
        let projectId = findProjectIdFromSource(req, source)

        if (projectId) {
            if (shouldIsAllowedInProject({
                user: signedUser,
                projectId,
                allowed
            }))
                return true
        }

        return false
    }
}

const findJobIdFromSource = (req, source) => {
    let jobId
    switch (source) {
        case "body":
            jobId = req.body.jobId
            break;
        case "params":
            jobId = req.params.jobId
            break;
        case "query":
            jobId = req.query.jobId
            break;
        default:
            return false
    }

    return jobId
}

const shouldIsAllowedInJob = ({
    user,
    jobId,
    allowed
}) => {
    return user && user.jobs && user.jobs.some(job => {
        return job._id.equals(jobId) && isAllowed(job.role, allowed)
    })
}

const isInJob = (allowed, source) => {
    if (allowed.indexOf("admin") > -1) {
        allowed += ' owner'
    }
    if (allowed.indexOf("user") > -1) {
        allowed += ' admin owner'
    }

    return (req) => {
        const signedUser = req.user
        let jobId = findJobIdFromSource(req, source)

        if (jobId) {
            if (shouldIsAllowedInJob({
                user: signedUser,
                jobId,
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
                default:
                    break
            }
        }

        return res.status(403).json({
            message: "You don't have authorization to do this action!"
        })
    }
}