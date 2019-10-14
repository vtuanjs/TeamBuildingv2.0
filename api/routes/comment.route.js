const express = require("express")
const router = express.Router()
const comment = require("../controllers/comment")
const authentication = require("../middlewares/auth")
const checkPermit = require("../middlewares/permistion")

router.post('/',
    authentication.required, checkPermit({
        model: 'job',
        role: 'user',
        source: 'query'
    }),
    comment.postComment
)

router.put('/:commentId',
    authentication.required,
    comment.updateComment
)

router.delete('/:commentId',
    authentication.required,
    comment.deleteComment
)

router.get('/',
    authentication.required, checkPermit({
        model: 'job',
        role: 'user',
        source: 'query'
    }),
    comment.getComments
)

router.get('/:commentId',
    authentication.required,
    comment.getComment
)

module.exports = router