const express = require("express")
const router = express.Router()
const project = require("../controllers/project")
const authentication = require("../middlewares/auth")
const checkPermit = require("../middlewares/permistion")

router.post("/", authentication.required, project.postProject)

router.post("/:projectId/delete", authentication.required, checkPermit({
    model: "project",
    role: "owner",
    source: "params"
}), project.deleteProject)

router.post("/:projectId/restore", authentication.required, checkPermit({
    model: "project",
    role: "owner",
    source: "params"
}), project.undoDeleteProject)

router.delete("/:projectId", authentication.required, checkPermit({
    model: "project",
    role: "owner",
    source: "params"
}), project.deleteImmediately)

router.post("/:projectId/stored", authentication.required, checkPermit({
    model: "project",
    role: "owner",
    source: "params"
}), project.storedProject)

router.post("/:projectId/undoStored", authentication.required, checkPermit({
    model: "project",
    role: "owner",
    source: "params"
}), project.undoStoredProject)

router.put("/:projectId", authentication.required, checkPermit({
    model: "project",
    role: "owner",
    source: "params"
}), project.updateProject)

router.get("/", authentication.required, project.getProjects)
router.get("/:projectId", authentication.required, checkPermit({
    model: "project",
    role: "user",
    source: "params"
}), project.getProject)

router.post("/:projectId/add-members", authentication.required, checkPermit({
    model: "project",
    role: "user",
    source: "params"
}), project.addMembers)

router.post("/:projectId/remove-members", authentication.required, checkPermit({
    model: "project",
    role: "admin",
    source: "params"
}), project.removeMembers)

router.get("/:projectId/show-members", authentication.required, project.showMembers)

router.post("/:projectId/agree-join-project", authentication.required, project.agreeJoinProject)

router.post("/:projectId/disagree-join-project", authentication.required, project.disAgreeJoinProject)

router.post("/:projectId/leave-project", authentication.required, project.leaveProject)

router.post("/:projectId/change-user-role", authentication.required, checkPermit({
    model: "project",
    role: "owner",
    source: "params"
}), project.changeUserRole)

module.exports = router