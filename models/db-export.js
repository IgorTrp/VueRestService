const dbConfig = require("../config/dbconfig.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {host: dbConfig.HOST,port: dbConfig.PORT,dialect: dbConfig.dialect,});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
