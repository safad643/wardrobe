const mongo=require('../mongodb/mongo')

const usersession=(req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/user/login')
  }
}




const islogin=(req,res,next)=>{
  if(req.session.user){
    res.redirect('/user/home')
  }
  else{
    next()
  }
}

const adminsession=(req,res,next)=>{
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin')
  }
}

const checkBan=async(req,res,next)=>{
  const db =await mongo()
  const email=req.session.email ||req.body.email
  const ban =await db.collection('users').find({email}).project({ list: 1 }).toArray()
  if(ban[0]?.list){
    res.render('user/ban')
  }else{
    next()
  }
  
}
module.exports={
  checkBan,
  adminsession,
  islogin,
  usersession
}