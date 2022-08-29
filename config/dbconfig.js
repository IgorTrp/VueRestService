module.exports = {
  HOST: "ec2-63-32-248-14.eu-west-1.compute.amazonaws.com",
  PORT: "5432",
  USER: "bekttbbiftwvqn",
  PASSWORD: "ab14fbe449d2550913f99bbb23104385b55878e785fa15e45552958ef8da6e46",
  DB: "d8kg218b8se9t",
  dialect: "postgres",
  dialectOptions:{
	ssl:{
		require:true,
		rejectUnauthorized:false
	}
  }
};