const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (emailObject) => {
  try {
    const { to, template, subject, data } = emailObject;

    const templatePath = path.resolve("templates", template + ".ejs");

    const templateFile = await new Promise((resolve, reject) => {
      fs.readFile(templatePath, "utf-8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    const renderedHTML = ejs.render(templateFile, data);

    await transporter.sendMail({
      from: "reminder@taskify.co",
      to,
      subject,
      html: renderedHTML,
    });

    console.log("Email sent");
  } catch (err) {
    throw err;
  }
};

module.exports = sendEmail;
