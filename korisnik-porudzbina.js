const ekspres = require("express");
const path=require("path");
const ruter=ekspres.Router();
const db = require("./models/db-export.js");
const joi=require("Joi");
const cors = require('cors')


var corsOptions = {
  origin: 'http://localhost:9000',
  optionsSuccessStatus: 200
}

ruter.use(cors(corsOptions));
const semai=joi.object({
  id:                joi.number().integer().required(),
  korisnikId:        joi.number().integer().required(),
  porudzbinaId:      joi.number().integer().required()
});
const semad=joi.object({
  id:           joi.number().integer().required()
});
const semau=joi.object({
  id:                joi.number().integer().required(),
  korisnikId:        joi.number().integer().allow(''),
  porudzbinaId:      joi.number().integer().allow('')
});

ruter.use(ekspres.json());
ruter.use(ekspres.urlencoded({ extended: true }));

//GET
ruter.get("/", (req,res)=>{
  db.sequelize.query('SELECT * FROM KorisnikPorudzbina')
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
});
  
//Update
ruter.put("/",  (req,res)=>{
  let br=0;
  let text="UPDATE KorisnikPorudzbina SET "
  const par1=req.body.id;
  const par2=req.body.korisnikId;
  const par3=req.body.porudzbinaId;


  if(par2 !== null && par2!=='' && typeof par2!=='undefined'){
    text+=" KorisnikId="+par2;
    br++;
  }
  if(par3 !== null && par3!=='' && typeof par3!=='undefined'){
    if(br>0)
      text+=" , "
    text+="PorudzbinaId="+par3;
    br++;
  }

  if(par1 !== null && par1!=='' && typeof par1!='undefined');
    text+=" WHERE Id="+par1;

  

  let { value,error } = semau.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
  db.sequelize.query(text)
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
  }

});

//insert
ruter.post("/", (req,res)=>{
  const par1=req.body.id;
  const par2=req.body.korisnikId;
  const par3=req.body.porudzbinaId;

  let { value,error } = semai.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
  res.send(db.sequelize.query("INSERT INTO KorisnikPorudzbina values ("+par1+","+par2+","+par3 +")"))
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
  }
});
//delete
ruter.delete("/", (req,res)=>{
  let { value,error } = semad.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
  const param1=req.body.id;
  res.send(db.sequelize.query("DELETE FROM KorisnikPorudzbina WHERE Id="+param1))
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
  }
});

module.exports=ruter;