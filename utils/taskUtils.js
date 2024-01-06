const moment = require("moment");
const Task = require("../models/tasks");
const User = require("../models/user");
const client = require("../storage/redis");
const isValidDateString = require("./isValidDateString");
const requestChecker = require("./requestChecker");

const queueName = process.env.REDIS_COMPLETION_QUEUE;
const queueRange = Number(process.env.REDIS_COMPLETION_RANGE);

const commonTaskChecks = (body) => {
  const { title, description, dueDate } = body;

  const emptyFields = requestChecker({ Title: title, Description: description, "Due Date": dueDate });
  if (emptyFields) {
    return emptyFields;
  }

  if (!isValidDateString(dueDate)) {
    return "Due Date is not valid";
  }

  // const pastDueDate = moment(dueDate).endOf("day").valueOf() < moment().add(330, "minutes").endOf("day").valueOf();
  const pastDueDate = moment(dueDate).endOf("day").valueOf() < moment().endOf("day").valueOf();
  if (pastDueDate) {
    return "Due Date can't be a past date";
  }
};

const createRediskey = (user) => `tasks:${user}`;

const updateRedis = async (user) => {
  const key = createRediskey(user);
  const allTasks = await Task.find({ user });
  const isPresent = await client.get(key);

  if (!isPresent) {
    await client.set(key, JSON.stringify(allTasks), "EX", 5 * 50);
  } else {
    const currentExpiration = await client.ttl(key);
    await client.set(key, JSON.stringify(allTasks), "XX");
    if (currentExpiration > 0) {
      await client.expire(key, currentExpiration);
    }
  }
  return;
};

const processTaskCompletion = async () => {
  const range = await client.llen(queueName);

  if (range >= queueRange) {
    const tasks = await client.lrange(queueName, 0, queueRange);

    console.log(`Updating ${tasks.length} tasks`);

    const erroredTaskIds = [];
    await Promise.allSettled(
      tasks.map(async (task) => {
        try {
          await Task.findByIdAndUpdate(task, { status: "completed" });
          console.log("Updated task with task id: ", task);
        } catch (err) {
          erroredTaskIds.push(task);
          console.error(`Error updating task with task id ${task}:`, err);
        }
      })
    );

    console.log("Task Updation Completed");
    const trimmed = await client.ltrim(queueName, queueRange, -1);
    console.log({ trimmed });
    if (erroredTaskIds.length > 0) {
      console.log(`Tasks with errors: ${erroredTaskIds.join(", ")}`);
      await client.rpush(queueName, ...erroredTaskIds);
    }

    const users = await User.find();
    users.map((user) => updateRedis(user._id));
  }
};

module.exports = { commonTaskChecks, createRediskey, updateRedis, processTaskCompletion };
