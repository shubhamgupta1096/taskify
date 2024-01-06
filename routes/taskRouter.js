const { Router } = require("express");
const taskController = require("../controllers/taskController");
const taskUserRelationCheck = require("../middlewares/taskUserRelationCheck");

const router = Router();

router.route("/").get(taskController.getTasks).post(taskController.createTask).put(taskUserRelationCheck, taskController.updateTask);
router.route("/:taskId").patch(taskUserRelationCheck, taskController.markTaskAsCompleted).delete(taskUserRelationCheck, taskController.deleteTask);

module.exports = router;
