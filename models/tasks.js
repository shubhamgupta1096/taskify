const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: [true, "Task must have a title"] },
    description: { type: String, required: [true, "Task must have a description"] },
    dueDate: { type: Date, required: [true, "Task must have a due date"] },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
  },
  { timestamps: true }
);

schema.index({ user: 1, dueDate: 1, status: 1 });

const Task = model("Task", schema);
module.exports = Task;
