const ekspres = require("express");
const ruter=ekspres.Router();
const db = require("./models/index.js");
const joi=require("joi");
const cors = require('cors')
const fetch = require('node-fetch');
//const cookieParser = require('cookie-parser');

/*async function overiPovlastice(req){
  
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
}*/


var corsOptions = {
    origin: true,
    credentials: true,
  optionsSuccessStatus: 200
}

ruter.use(cors(corsOptions));
const semai=joi.object({
  Id:             joi.number().integer().required(),
  Sadrzaj:             joi.string().max(200).required(),
  Token:             joi.string().optional()
});
const semad=joi.object({
  id:             joi.number().integer().required(),
  token:             joi.string().optional(),
  ime:             joi.string().optional(),
  datum:             joi.string().optional(),
  sadrzaj:             joi.string().optional(),
});

ruter.use(ekspres.json());
ruter.use(ekspres.urlencoded({ extended: true }));
//ruter.use(cookieParser());

//GET
ruter.get("/", async(req,res)=>{
  if(isNaN((parseInt(req.query.id)))){
  db.sequelize.query('SELECT KorisnickoIme,Sadrzaj,COUNT(o.goreglasovi) AS gore,COUNT(o.doleglasovi) AS dole,Datum FROM komentar LEFT JOIN korisnik AS kr ON komentar.KorisnikId = kr.Id LEFT JOIN ocena AS o ON komentar.id=o.komentarid GROUP BY komentar.id,komentar.korisnikid, komentar.korisnikid,kr.KorisnickoIme,komentar.Sadrzaj,komentar.datum ORDER BY Datum DESC  LIMIT 100')
  .then(function(result) {res.status(200).send(result);})
  .catch( err => res.status(500).json(err) );
  }
  else{
    db.sequelize.query("SELECT KorisnickoIme,Sadrzaj,COUNT(o.goreglasovi) AS gore,COUNT(o.doleglasovi) AS dole,Datum FROM komentar LEFT JOIN korisnik AS kr ON komentar.KorisnikId = kr.Id LEFT JOIN ocena AS o ON komentar.id=o.komentarid WHERE KorisnickoIme ='"+req.query.ime+"' GROUP BY komentar.id,komentar.korisnikid, komentar.korisnikid,kr.KorisnickoIme,komentar.Sadrzaj,komentar.datum ORDER BY Datum DESC  LIMIT 100")
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
    body: JSON.stringify({povlastice:req.body.Token})
}).then(resp=>{
    if(resp.status==400 || resp.status==500){
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
ruter.delete("/", async(req,res)=>{

  let overa= await fetch('https://vue-verification.herokuapp.com/authLoggedIn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' ,'Access-Control-Allow-Origin': '*'},
    credentials: 'include',
    body: JSON.stringify({povlastice:req.body.token})
  }).then(resp=>{
    if(resp.status==400 || resp.status==500){
      res.status(500).send("Niste ulogovani");
      return false
    }
    else{
      return true;
    }
    });

  if(overa){

  const param1=req.body.id;
  const param2=req.body.sadrzaj;
  const param3=req.body.datum;

  let { value,error } = semad.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
  db.sequelize.query("DELETE FROM Komentar WHERE korisnikid="+param1 +" AND sadrzaj='"+param2+"' AND datum='"+param3+"';")
  .then(function(result) {res.status(200).send(result);})
  .catch( err => res.status(500).json(err) );
  }

  }
});

module.exports=ruter;