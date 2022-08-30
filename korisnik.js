const ekspres = require("express");
const ruter=ekspres.Router();
const db = require("./models/index.js");
const joi=require("joi");
const cors = require('cors');
const bcrypt=require('bcrypt');
const fetch = require('node-fetch');
const cookieParser = require('cookie-parser');


async function overiPovlastice(req){
  
  let token=req.cookies['token'];
  data={
    povlastice:token
  };

  vrednost=await fetch('https://vue-verification.herokuapp.com/auth', {
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
  primalacId:        joi.number().integer().required(),
  povlastice:        joi.string().max(50).required(),
  korisnickoIme:     joi.string().max(50).required(),
  lozinka:           joi.string().max(256).required(),
  datumRegistracije: joi.string().max(50).required()
});
const semad=joi.object({
  id:                joi.number().integer().required(),
});
const semau=joi.object({
  id:                joi.number().integer().required(),
  primalacId:        joi.number().integer().allow(''),
  povlastice:        joi.string().max(50).allow(''),
  korisnickoIme:     joi.string().max(50).allow(''),
  lozinka:           joi.string().max(256).allow(''),
  datumRegistracije: joi.string().max(50).allow('')
});

const semar=joi.object({
  korisnickoIme:     joi.string().max(50).required(),
  lozinka:           joi.string().max(50).required()
});

const semac=joi.object({
  korisnickoIme:     joi.string().max(50).required(),
  lozinka:           joi.string().max(50).required()
});

ruter.use(ekspres.json());
ruter.use(ekspres.urlencoded({ extended: true }));
ruter.use(cookieParser());

//GET
ruter.get("/", async(req,res)=>{
  console.log(overiPovlastice(req)===false);
  if(await overiPovlastice(req)===false)
    res.status(500).send("nemate povlasticu");
  else
  db.sequelize.query('SELECT * FROM Korisnik')
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
});
  
//Update
ruter.put("/",  async(req,res)=>{
  if(await overiPovlastice(req)===false)
    res.status(500).send("nemate povlasticu");
  else{
  let br=0;
  let text="UPDATE Korisnik SET "
  const par1=req.body.id;
  const par2=req.body.primalacId;
  const par3=req.body.povlastice;
  const par4=req.body.korisnickoIme;
  const par5=req.body.lozinka;
  const par6=req.body.datumRegistracije;


  if(par2 !== null && par2!=='' && typeof par2!=='undefined'){
    text+=" PrimalacId='"+par2+"'";
    br++;
  }
  if(par3 !== null && par3!=='' && typeof par3!=='undefined'){
    if(br>0)
      text+=" , "
    text+="Povlastice='"+par3+"'";
    br++;
  }
  if(par4 !== null && par4!=='' && typeof par4!=='undefined'){
    if(br>0)
      text+=" , "
    text+="KorisnickoIme='"+par4+"'";
    br++;
  }
  if(par5 !== null && par5!=='' && typeof par5!=='undefined'){
    if(br>0)
      text+=" , "
    text+="Lozinka='"+par5+"'";
    br++;
  }
  if(par6 !== null && par6!=='' && typeof par6!=='undefined'){
    if(br>0)
      text+=" , "
    text+="DatumRegistracije='"+par6+"'";
    br++;
  }

  if(par1 !== null && par1!=='' && typeof par1!='undefined');
    text+=" WHERE id="+par1;

  
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
  const par2="'"+req.body.primalacId+"'";
  const par3="'"+req.body.povlastice+"'";
  const par4="'"+req.body.korisnickoIme+"'";
  let par5="'"+req.body.lozinka+"'";
  const par6="'"+req.body.datumRegistracije+"'";

  //sifrovanje lozinke
  try {
    par5=await bcrypt.hash(req.body.lozinka, 10);
    par5="'"+par5+"'";
  } catch {
    res.status(500).send();
  }



  let { value,error } = semai.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
    try{
    let result=db.sequelize.query("INSERT INTO Korisnik values ("+par1+","+par2+","+par3+","+par4+","+par5+","+par6+")")
      res.send(result).status(200);
    }
    catch{
      res.status(500).send();
    }
  }
}});


//delete
ruter.delete("/", async(req,res)=>{
  if(await overiPovlastice(req)===false)
  res.status(500).send("nemate povlasticu");
else{

  let { value,error } = semad.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
  const param1=req.body.id;
  db.sequelize.query("DELETE FROM Korisnik WHERE Id="+param1)
  .then(function(result) {res.send(result);})
  .catch( err => res.status(500).json(err) );
  }
}
});




ruter.post("/register", async(req,res)=>{
  const par1=Math.floor((Math.random() * 1000000) + 1);
  const par2="'"+req.body.korisnickoIme+"'";
  let par3="'"+req.body.lozinka+"'";
  const par4="'"+req.body.povlastice+"'";

  try {
    par3= await bcrypt.hash(req.body.lozinka,10);
    par3="'"+par3+"'";
  } 
  catch {
    res.status(500).send("gresak u desifrovanju");
  }

  let result;
  let { value,error } = semar.validate(req.body);
  if(typeof error !== 'undefined'){
    res.status(400).send(error.details);
  }
  else{
    try{
      result =  db.sequelize.query("INSERT INTO Korisnik (id,povlastice,korisnickoIme,lozinka) values ("+par1+",'k',"+par2+","+par3+")");
      res.send("Uspesna registracija").status(200);
      }
    catch{
      res.status(500).send("greska sa bazom");
  }
  }

});


ruter.post("/checkUserPrivilage", async(req,res)=>{
  const par1="'"+req.body.korisnickoIme+"'";
  let par2=req.body.lozinka;

  //PROVERAVAMO ISPRAVNOST
  let { value,error } = semac.validate(req.body);
  if(typeof error !== 'undefined'){
    console.log("neispravan format");
    res.status(400).send(error.details);
  }
  else{
    try{
  //dobavljamo podatke iz baze
  const result = await db.sequelize.query("SELECT Povlastice,Lozinka FROM Korisnik WHERE KorisnickoIme="+par1,{type: db.sequelize.QueryTypes.SELECT});
  //uporedjujemo lozinku
  let povlastice=result[0].povlastice;
  let lozinka=result[0].lozinka;

  if(!bcrypt.compareSync(par2, lozinka)){
    if(!lozinka){
      res.status(500).send("Greska bazi lozinka nije ucitana");
    }
    else{
      res.status(500).send("Greska u lozinci ili korisnickom imenu");
    }
    console.log("Lozinke se ne podudaraju");
  }
  else{
    //u zavisnosti od vrednosti vracamo povlastice
    let odgovor; 
    if(povlastice==='a')
      odgovor = {povlastice: 'a'};
    if(povlastice==='m')
      odgovor = {povlastice: 'm'};
    if(povlastice==='k')
      odgovor = {povlastice: 'k'};
    if(povlastice !=='a' && povlastice!=='m' && povlastice!=='k')
      odgovor = {povlastice: '0'};
  res.status(200).send(odgovor);
  
    }
  }
  catch(err){
    console.log("Nesto je poslo po zlu"+err);
    res.status(500).send();
  }
  }
});

//Dobavljanje ID preko imena
ruter.post("/getUserId", async(req,res)=>{
  const par1="'"+req.body.korisnickoIme+"'";


    try{
  //dobavljamo podatke iz baze
  const result = await db.sequelize.query("SELECT Id FROM Korisnik WHERE KorisnickoIme="+par1,{type: db.sequelize.QueryTypes.SELECT});
  const id=result[0].id;
  res.status(200).send({Id:id});
  }
  catch(err){
    console.log("Nesto je poslo po zlu"+err);
    res.status(500).send("Greska "+err);
  }
  
});

module.exports=ruter;