const redis = require('./redis')

module.exports.cacheUser = (req, res, next) => {
    const userId = req.params.userId
    redis.get(userId, (err, data) => {
        if (err) next(err);
        if (data) {
            res.json({ user: JSON.parse(data) })
        } else {
            next()
        }
    })
}
module.exports.cacheProject = (req, res, next) => {
    const projectId = req.params.projectId
    redis.get(projectId, (err, data) => {
        if (err) next(err);
        if (data) {
            res.json({ user: JSON.parse(data) })
        } else {
            next()
        }
    })
}
module.exports.cacheJob = (req, res, next) => {
    const jobId = req.params.jobId
    redis.get(jobId, (err, data) => {
        if (err) next(err);
        if (data) {
            res.json({ user: JSON.parse(data) })
        } else {
            next()
        }
    })
}
module.exports.cacheComment = (req, res, next) => {
    const commentId = req.params.commentId
    redis.get(commentId, (err, data) => {
        if (err) next(err);
        if (data) {
            res.json({ user: JSON.parse(data) })
        } else {
            next()
        }
    })
}