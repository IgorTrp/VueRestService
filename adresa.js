const ekspres = require("express");
const ruter=ekspres.Router();
const db = require("./models/index.js");
const joi=require("joi");
const cors = require('cors');
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
  id:           joi.number().integer().required(),
  drzava:       joi.string().max(50).required(),
  grad:         joi.string().max(50).required(),
  postanskiBroj:joi.string().max(50).required(),
  ulica:        joi.string().max(50).required(),
  brojstana:    joi.number().integer().required()
});

const semad=joi.object({
  id:           joi.number().integer().required(),
});

const semma=joi.object({
  id:           joi.number().integer().required(),
  drzava:       joi.string().max(50).allow(''),
  grad:         joi.string().max(50).allow(''),
  postanskiBroj:joi.string().max(50).allow(''),
  ulica:        joi.string().max(50).allow(''),
  brojstana:    joi.number().integer().allow('')
});

ruter.use(ekspres.json());
ruter.use(ekspres.urlencoded({ extended: true }));
ruter.use(cookieParser());

//GET
ruter.get("/", async(req,res)=>{
  if(await overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");
else

  if(await overiPovlastice(req)===false)
    res.status(500).send("nemate povlasticu");
  else
  db.sequelize.query('SELECT * FROM Adresa')
  .then(function(result) {res.status(200).send(result);})
  .catch( err => res.status(500).json(err) );
});
  
//Update
ruter.put("/",  async(req,res)=>{
  if(await overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");
else{

  if(overiPovlastice(req)===false)
    res.status(500).send("nemate povlasticu");
  else{
  let br=0;
  let text="UPDATE Adresa SET "
  const par1=req.body.id;
  const par2=req.body.drzava;
  const par3=req.body.grad;
  const par4=req.body.postanskiBroj;
  const par5=req.body.ulica;
  const par6=req.body.brojstana;


  if(par2 !== null && par2!=='' && typeof par2!=='undefined'){
    text+=" Drzava='"+par2+"'";
    br++;
  }
  if(par3 !== null && par3!=='' && typeof par3!=='undefined'){
    if(br>0)
      text+=" , "
    text+="Grad='"+par3+"'";
    br++;
  }
  if(par4 !== null && par4!=='' && typeof par4!=='undefined'){
    if(br>0)
      text+=" , "
    text+="PostanskiBroj='"+par4+"'";
    br++;
  }
  if(par5 !== null && par5!=='' && typeof par5!=='undefined'){
    if(br>0)
      text+=" , "
    text+="Ulica='"+par5+"'";
    br++;
  }
  if(par6 !== null && par6!=='' && typeof par6!=='undefined'){
    if(br>0)
      text+=" , "
    text+="BrojStana="+par6;
    br++;
  }

  if(par1 !== null && par1!=='' && typeof par1!='undefined');
    text+=" WHERE id="+par1;


  let { value,error } = semma.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
  db.sequelize.query(text)
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
  }
}
}
});

//insert
ruter.post("/", async(req,res)=>{
  if(await overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");
else{

  if(overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");
  const par1=req.body.id;
  const par2="'"+req.body.drzava+"'";
  const par3="'"+req.body.grad+"'";
  const par4="'"+req.body.postanskiBroj+"'";
  const par5="'"+req.body.ulica+"'";
  const par6=req.body.brojstana;


  let { value,error } = semai.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
  db.sequelize.query("INSERT INTO Adresa values ("+par1+","+par2+","+par3+","+par4+","+par5+","+par6+")")  
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

  if(overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");

  let { value,error } = semad.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
  const param1=req.body.id;
  db.sequelize.query("DELETE FROM Adresa WHERE Id="+param1)  
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
  }
}
});

module.exports=ruter;