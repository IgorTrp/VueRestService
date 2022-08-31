const ekspres = require("express");
const path=require("path");
const ruter=ekspres.Router();
const db = require("./models/index.js");
const joi=require("joi");
const cors = require('cors')
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');


async function overiPovlastice(req){
  
  let token=req.cookies['token'];
  data={
    povlastice:token
  };

  vrednost=await fetch('https://vue-verification.herokuapp.com/authm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body:JSON.stringify(data)
  }).then(res=>{
    if(res.status===400 || res.status===500){
      return false;
      
    }
    else{
      return true;
    }
    });
    return vrednost;
}


var corsOptions = {
    origin: true,
    credentials: true,
  optionsSuccessStatus: 200
}

ruter.use(cors(corsOptions));
const semai=joi.object({
  id:                joi.number().integer().required(),
  proizvodId:        joi.number().integer().required(),
  naznake:           joi.string().max(50).required(),
  status:            joi.string().max(50).required(),
  vremeNastanka:     joi.string().max(50).required(),
  korisnikId:     joi.string().max(50).required(),
  token:              joi.required()
});
const semad=joi.object({
  id:                joi.number().integer().required(),
  token:              joi.required()
});
const semau=joi.object({
  id:                joi.number().integer().required(),
  proizvodId:        joi.number().integer().allow(''),
  naznake:           joi.string().max(50).allow(''),
  status:            joi.string().max(50).allow(''),
  vremeNastanka:     joi.string().max(50).allow(''),
  korisnikId:     joi.string().max(50).allow(''),
  token:              joi.required()
});


ruter.use(ekspres.json());
ruter.use(ekspres.urlencoded({ extended: true }));
ruter.use(cookieParser());


//GET
ruter.post("/get", async(req,res)=>{
  if(await overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");
else
  db.sequelize.query('SELECT * FROM Porudzbina')
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
});
  
//Update
ruter.put("/",  async(req,res)=>{
  if(await overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");
else{

  let br=0;
  let text="UPDATE Porudzbina SET "
  const par1=req.body.id;
  const par2=req.body.proizvodId;
  const par3=req.body.naznake;
  const par4=req.body.status;
  const par5=req.body.vremeNastanka;
  const par6=req.body.korisnikId;


  if(par2 !== null && par2!=='' && typeof par2!=='undefined'){
    text+=" ProizvodId="+par2;
    br++;
  }
  if(par3 !== null && par3!=='' && typeof par3!=='undefined'){
    if(br>0)
      text+=" , "
    text+="Naznake='"+par3+"'";
    br++;
  }
  if(par4 !== null && par4!=='' && typeof par4!=='undefined'){
    if(br>0)
      text+=" , "
    text+="Status='"+par4+"'";
    br++;
  }
  if(par5 !== null && par5!=='' && typeof par5!=='undefined'){
    if(br>0)
      text+=" , "
    text+="VremeNastanka='"+par5+"'";
    br++;
  }
  if(par6 !== null && par6!=='' && typeof par6!=='undefined'){
    if(br>0)
      text+=" , "
    text+="KorisnikId="+par6;
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
}
});

//insert
ruter.post("/", async(req,res)=>{
  if(await overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");
else{

  const par1=req.body.id;
  const par2=req.body.proizvodId;
  const par3="'"+req.body.naznake+"'";
  const par4="'"+req.body.status+"'";
  const par5="'"+req.body.vremeNastanka+"'";
  const par6=req.body.korisnikId;

  let { value,error } = semai.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
  db.sequelize.query("INSERT INTO Porudzbina values ("+par1+","+par2+","+par3+","+par4+","+par5+","+par6+")")
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
  }
}
});
//delete
ruter.delete("/", async(req,res)=>{
  if(await overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");
else{

  const param1=req.body.id;

  let { value,error } = semad.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
  db.sequelize.query("DELETE FROM Porudzbina WHERE Id="+param1)
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
  }
}
});

module.exports=ruter;