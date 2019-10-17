const express = require("express")
const router = express.Router()
const job = require("../controllers/job")
const authentication = require("../middlewares/auth")
const checkPermit = require("../middlewares/permistion")

router.post("/", authentication.required, checkPermit({
    model: 'project',
    role: 'admin',
    source: 'query'
}, {
    model: 'project',
    role: 'user',
    source: 'query'
}), job.postJob)

router.post("/sub-job", authentication.required, checkPermit({
    model: 'job',
    role: 'user',
    source: 'query'
}), job.postSubJob)

router.get("/", authentication.required, checkPermit({
    model: 'project',
    role: 'user',
    source: 'query'
}), job.getJobs)

router.get("/sub-jobs", authentication.required, checkPermit({
    model: 'project',
    role: 'user',
    source: 'query'
}), job.getSubJobs)

router.get("/:jobId", authentication.required, checkPermit({
    model: "job",
    role: "user",
    source: "params"
}), job.getJob)

router.post("/:jobId/delete", authentication.required, checkPermit({
    model: "job",
    role: "owner",
    source: "params"
}), job.deleteJob)

router.post("/:jobId/restore", authentication.required, checkPermit({
    model: "job",
    role: "owner",
    source: "params"
}), job.undoDeleteJob)

router.delete("/:jobId", authentication.required, checkPermit({
    model: "job",
    role: "owner",
    source: "params"
}), job.deleteImmediately)

router.post("/:jobId/completed", authentication.required, checkPermit({
    model: "job",
    role: "owner",
    source: "params"
}), job.completedJob)

router.post("/:jobId/undoCompleted", authentication.required, checkPermit({
    model: "job",
    role: "owner",
    source: "params"
}), job.undoCompletedJob)

router.put("/:jobId", authentication.required, checkPermit({
    model: "job",
    role: "owner",
    source: "params"
}), job.updateJob)

router.post("/:jobId/add-members", authentication.required, checkPermit({
    model: "job",
    role: "user",
    source: "params"
}), job.addMembers)

router.post("/:jobId/remove-members", authentication.required, checkPermit({
    model: "job",
    role: "admin",
    source: "params"
}), job.removeMembers)

router.post("/:jobId/agree-join-job", authentication.required, job.agreeJoinJob)

router.post("/:jobId/disagree-join-job", authentication.required, job.disAgreeJoinJob)

router.post("/:jobId/leave-job", authentication.required, job.leaveJob)

router.get("/:jobId/show-members", authentication.required, job.showMembers)

router.post("/:jobId/change-user-role", authentication.required, checkPermit({
    model: "job",
    role: "owner",
    source: "params"
}), job.changeUserRole)

module.exports = router