require("dotenv").config();
const app = require("./app");
const connectDB = require("./storage/mongodb");

const PORT = process.env.PORT || 9000;

connectDB()
  .then(() => {
    console.log("Connected to Database");
    app.listen(PORT, () => {
      console.log(`Server started on Port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error Connecting to Database");
  });
