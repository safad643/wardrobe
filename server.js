require('dotenv').config()
const express=require('express')
const nochache=require('nocache')
const session=require('express-session')
const flash=require('connect-flash')
const path=require('path')
const app=express()
const passportsetup=require('./config/passport')
const userRoutes=require('./routes/userRoutes')
const adminrouter=require('./routes/adminRoutes')
const authroutes=require('./routes/authroutes')
const allowedIP='223.239.36.18'
app.use("/admin", (req, res, next) => {
    const clientIP = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (clientIP !== allowedIP) {
        return res.status(403).send("Access Denied");
    }
    next();
});
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,             
    saveUninitialized: true,   
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}))
app.use(flash())
app.use(passportsetup.initialize());
app.use(passportsetup.session());
app.use(nochache())
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use('/auth',authroutes)
app.use('/user',userRoutes)
app.use('/',userRoutes)
app.use('/admin',adminrouter)
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(express.static(path.join(__dirname,'public')))
app.set('view engine','ejs')
app.listen(process.env.PORT)
app.use((req,res,next)=>{
    res.send('doesnt exist')
})


