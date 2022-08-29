const ekspres = require("express");
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
  Id:             joi.number().integer().required(),
  Sadrzaj:             joi.string().max(200).required()
});
const semad=joi.object({
  id:             joi.number().integer().required(),
});

ruter.use(ekspres.json());
ruter.use(ekspres.urlencoded({ extended: true }));
ruter.use(cookieParser());

//GET
ruter.get("/", async(req,res)=>{
  if(isNaN((parseInt(req.query.id)))){
  db.sequelize.query('SELECT KorisnikId,KorisnickoIme,Sadrzaj,Goreglasovi,Doleglasovi,Datum FROM Komentar LEFT JOIN Korisnik ON Komentar.KorisnikId = Korisnik.Id ORDER BY Datum Desc LIMIT 100')
  .then(function(result) {res.status(200).send(result);})
  .catch( err => res.status(500).json(err) );
  }
  else{
    db.sequelize.query('SELECT KorisnikId,KorisnickoIme,Sadrzaj,Goreglasovi,Doleglasovi,Datum FROM Komentar LEFT JOIN Korisnik ON Komentar.KorisnikId = Korisnik.Id WHERE Komentar.KorisnikId ='+req.query.id+' ORDER BY Datum Desc')
    .then(function(result) {res.status(200).send(result);})
    .catch( err => res.status(500).json(err) );
  }
}
);

//GET NEWEST
ruter.get("/getNewest", async(req,res)=>{
  if(isNaN((parseInt(req.query.id)))){
  db.sequelize.query('SELECT KorisnickoIme,Sadrzaj,Datum FROM Komentar LEFT JOIN Korisnik ON Komentar.KorisnikId = Korisnik.Id ORDER BY Datum Desc LIMIT 1')
  .then(function(result) {res.status(200).send(result);})
  .catch( err => res.status(500).json(err) );
  }
  else{
    res.status(500).json("URL nije dobrog formata") 
  }
}
);


//insert
ruter.put("/", async(req,res)=>{
  fetch('https://vue-verification.herokuapp.com/authLoggedIn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' ,'Access-Control-Allow-Origin': '*'},
    credentials: 'include',
    body: JSON.stringify({})
}).then(resp=>{
    if(resp.status==400 && resp.status==500){
      res.status(500).send("Niste ulogovani");
      return;
    }});
  
  const par1=req.body.Id;
  const par2=req.body.Sadrzaj;

  let { value,error } = semai.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
    return;
  }
  else{
  let nd =new Date();
  let dan=nd.getFullYear()+"-"+(nd.getMonth()+1)+"-"+nd.getUTCDate()+" "+nd.getHours()+":"+nd.getMinutes()+":"+nd.getSeconds();

  await db.sequelize.query("Insert into Komentar (korisnikId,komentarid,sadrzaj,goreglasovi,doleglasovi,datum) values ("+par1+",null,'"+par2+"',0,0,'"+dan+"')")
  .then(resp=>{
    res.status(200).send({Sadrzaj:par2,Datum:dan,Goreglasovi:0,Doleglasovi:0})
  })
  .catch( erro =>{ res.status(500).send(erro);
    return;
    });
  }
  }
);

//delete
/*ruter.delete("/", async(req,res)=>{
  res.status(500).send("Ova primena nije omogucena");
  if(await overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");
else{

  const param1=req.body.id;
  let { value,error } = semad.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
  db.sequelize.query("DELETE FROM Primalac WHERE Id="+param1)
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
  }
}
});*/

module.exports=ruter;