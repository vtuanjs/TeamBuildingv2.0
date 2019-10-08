const Comment = require('./comment.model')

module.exports.postComment = async (req, res, next) => {
    const { body } = req.body
    const { jobId } = req.query
    const signedUser = req.user
    try {
        const comment = await Comment.create({
            body,
            commentOn: jobId,
            author: signedUser._id
        })

        return res.json({ message: `Create comment successfully!`, comment })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteComment = async (req, res, next) => {
    const { commentId } = req.params
    const signedUser = req.user
    try {
        const raw = await Comment.deleteOne({
            _id: commentId,
            author: signedUser._id
        })

        if (raw.ok != 1){
            throw 'Can not delete this comment'
        }

        return res.json({ message: "Delete comment successfully!", raw })
    } catch (error) {
        next(error)
    }
}

module.exports.updateComment = async (req, res, next) => {
    const { commentId } = req.params
    const { body } = req.body
    const signedUser = req.user
    try {
        let comment = await Comment.findOne({
            _id: commentId,
            author: signedUser._id
        })

        if (!comment){
            throw 'Comment not exitsts or you do not permistion'
        }

        comment = {
            ...comment,
            body,
            edited: [
                ...comment.edited, {
                    body: comment.body,
                    date: comment.date
                }
            ]
        }

        await comment.save()

        return res.json({ message: `Update comment successfully!`, comment })
    } catch (error) {
        next(error)
    }
}

module.exports.getComments = async (req, res, next) => {
    const { jobId } = req.query

    try {
        const comments = await Comment.find({
            commentOn: jobId
        }, "body commentOn createdAt")
            .populate('author', 'name')

        if (!comments) throw "Can not show comment"

        return res.json({ comments })
    } catch (error) {
        next(error)
    }
}

module.exports.getComment = async (req, res, next) => {
    const { commentId } = req.params

    try {
        const comment = await Comment.findById(commentId)
            .populate('author', 'name')

        if (!comment) throw "Wrong comment id"

        return res.json({ comment })
    } catch (error) {
        next(error)
    }
}