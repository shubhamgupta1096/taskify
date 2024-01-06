const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const schema = new Schema(
  {
    email: { type: String, unique: true, lowercase: true, validate: [validator.isEmail, "Please provide a valid email id!"] },
    name: String,
    password: { type: String, required: true },
  },
  { timestamps: true }
);

schema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) {
    next();
  }
  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;
});

schema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = model("User", schema);
module.exports = User;
