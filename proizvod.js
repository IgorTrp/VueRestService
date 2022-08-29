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

  vrednost=await fetch('http://localhost:11000/authm', {
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
  id:                 joi.number().integer().required(),
  opis:               joi.string().max(50).required(),
  naslov:             joi.string().max(200).required(),
  slikaPokazivac:     joi.string().max(50).required(),
  cena:               joi.number().integer().required()
});
const semad=joi.object({
  id:             joi.number().integer().required(),
});
const semau=joi.object({
  id:                 joi.number().integer().required(),
  opis:               joi.string().max(50).allow(''),
  naslov:             joi.string().max(200).allow(''),
  slikaPokazivac:     joi.string().max(50).allow(''),
  cena:               joi.number().integer().allow('')
});


ruter.use(ekspres.json());
ruter.use(ekspres.urlencoded({ extended: true }));
ruter.use(cookieParser());

ruter.get("/", async(req,res)=>{
  if(await overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");
else
  db.sequelize.query('SELECT * FROM Proizvod')
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
});
  
//Update
ruter.put("/",  async(req,res)=>{
  if(await overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");
else{

  let br=0;
  let text="UPDATE Proizvod SET "
  const par1=req.body.id;
  const par2=req.body.naslov;
  const par3=req.body.opis;
  const par4=req.body.slikaPokazivac;
  const par5=req.body.cena;


  if(par2 !== null && par2!=='' && typeof par2!=='undefined'){
    text+=" Naslov='"+par2+"'";
    br++;
  }
  if(par3 !== null && par3!=='' && typeof par3!=='undefined'){
    if(br>0)
      text+=" , "
    text+="Opis='"+par3+"'";
    br++;
  }
  if(par4 !== null && par4!=='' && typeof par4!=='undefined'){
    if(br>0)
      text+=" , "
    text+="SlikaPokazivac='"+par4+"'";
    br++;
  }
  if(par5 !== null && par5!=='' && typeof par5!=='undefined'){
    if(br>0)
      text+=" , "
    text+="cena='"+par5+"'";
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
  const par2="'"+req.body.naslov+"'";
  const par3="'"+req.body.opis+"'";
  const par4="'"+req.body.slikaPokazivac+"'";
  const par5=req.body.cena;


  let { value,error } = semai.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
  db.sequelize.query("INSERT INTO Proizvod values ("+par1+","+par2+","+par3+","+par4+","+par5+")")
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
  db.sequelize.query("DELETE FROM Proizvod WHERE Id="+param1)
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
  }
}
});

module.exports=ruter;