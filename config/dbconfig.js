module.exports = {
  HOST: "localhost",
  PORT: "1433",
  USER: "Igor",
  PASSWORD: "bazapodataka123",
  DB: "SkritBaza",
  dialect: "mssql",
  dialectOptions:{
	ssl:{
		require:true,
		rejectUnauthorized:false
	}
  }
};