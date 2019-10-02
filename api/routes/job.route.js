const express = require("express")
const router = express.Router()
const job = require("../controllers/job")
const authentication = require("../middlewares/auth")
const checkPermit = require("../middlewares/permistion")

router.post("/", authentication.required, job.postJob)

router.post("/sub-job", authentication.required, job.postSubJob)

router.post("/:jobId/send-to-trash", authentication.required, checkPermit({
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

// router.post("/:jobId/stored", authentication.required, checkPermit({
//     model: "job",
//     role: "owner",
//     source: "params"
// }), job.storedJob)

// router.post("/:jobId/undoStored", authentication.required, checkPermit({
//     model: "job",
//     role: "owner",
//     source: "params"
// }), job.undoStoredJob)

// router.put("/:jobId", authentication.required, checkPermit({
//     model: "job",
//     role: "owner",
//     source: "params"
// }), job.updateJob)

// router.get("/", authentication.required, job.getJobs)
// router.get("/:jobId", authentication.required, checkPermit({
//     model: "job",
//     role: "user",
//     source: "params"
// }), job.getJob)

// router.post("/:jobId/add-members", authentication.required, job.addMembers)
// router.post("/:jobId/remove-members", authentication.required, checkPermit({
//     model: "job",
//     role: "admin",
//     source: "params"
// }), job.removeMembers)

// router.post("/:jobId/agree-join-job", authentication.required, job.agreeJoinJob)

// router.post("/:jobId/disagree-join-job", authentication.required, job.disAgreeJoinJob)

// router.post("/:jobId/change-user-role", authentication.required, checkPermit({
//     model: "job",
//     role: "owner",
//     source: "params"
// }), job.changeUserRole)

module.exports = router