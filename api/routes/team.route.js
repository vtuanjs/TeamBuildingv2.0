const express = require("express")
const router = express.Router()
const team = require("../controllers/team")
const authentication = require("../middlewares/auth")
const checkPermit = require("../middlewares/permistion")

router.post('/', authentication.required, team.postTeam)

router.get('/', team.getTeams)

router.get('/get-by-user', authentication.required, team.getTeamsByUser)

router.get('/:teamId', authentication.required, team.getDetail)

router.put('/:teamId', authentication.required, checkPermit({
    model: 'team', role: 'owner', source: 'params'
}), team.updateTeam)

router.post("/:teamId/add-members", authentication.required, checkPermit({
    model: "team",
    role: "user",
    source: "params"
}), team.addMembers)

router.post("/:teamId/remove-members", authentication.required, checkPermit({
    model: "team",
    role: "admin",
    source: "params"
}), team.removeMembers)

router.post("/:teamId/agree-join-team", authentication.required, team.agreeJoinTeam)

router.post("/:teamId/disagree-join-team", authentication.required, team.disAgreeJoinTeam)

router.post("/:teamId/leave-team", authentication.required, team.leaveTeam)

router.post("/:teamId/change-user-role", authentication.required, checkPermit({
    model: "team",
    role: "owner",
    source: "params"
}), team.changeUserRole)

module.exports = router