const { Sequelize } = require("sequelize");

// Create a Sequelize instance for the database connection
const sequelize = new Sequelize("testDB", "root", "smeryoung097", {
  host: "127.0.0.1",
  dialect: "mysql",
});

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to Database!!!🥰");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err.message);
  });

module.exports = sequelize;
