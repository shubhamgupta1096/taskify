const cron = require("node-cron");
const moment = require("moment");
const Task = require("../models/tasks");
const sendEmail = require("../utils/emailHandler");

const taskReminder = async () => {
  console.log("Task Reminder Job running at 10:00 am");

  // const dateString = moment().add(330, "minutes").format("YYYY-MM-DD");
  const dateString = moment().format("YYYY-MM-DD");
  const filterDate = new Date(dateString);

  const tasks = await Task.aggregate([
    { $match: { dueDate: filterDate, status: "pending" } },
    { $group: { _id: "$user", tasks: { $push: "$$ROOT" } } },
    { $match: { $expr: { $gt: [{ $size: "$tasks" }, 0] } } },
    { $project: { _id: 0, user: "$_id", tasks: 1 } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [{ $project: { name: 1, email: 1 } }],
      },
    },
    { $unwind: "$user" },
  ]);

  tasks.map((entry) => {
    const { user, tasks } = entry;
    if (tasks.length) {
      const data = { to: user.email, subject: `${tasks.length} tasks due today`, data: { tasks, name: user.name }, template: "reminderEmail" };
      sendEmail(data);
    }
  });
};

cron.schedule("0 10 * * *", taskReminder, { scheduled: true, timezone: "Asia/Calcutta" });
