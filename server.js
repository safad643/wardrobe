require('dotenv').config()
const express=require('express')
const nochache=require('nocache')
const session=require('express-session')
const flash=require('connect-flash')
const path=require('path')
const { connect } = require('./mongodb/mongo')
const dbMiddleware = require('./midddlewares/db')
const app=express()
const passportsetup=require('./config/passport')
const userRoutes = require("./routes/user");
const adminrouter = require("./routes/admin");

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
app.use(dbMiddleware)
app.use("/user", userRoutes);
app.use('/',userRoutes)
app.use('/admin',adminrouter)
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(express.static(path.join(__dirname,'public')))
app.set('view engine','ejs');

// Connect to database and start server
(async () => {
  try {
    const db = await connect()
    app.locals.db = db
    console.log('Database connected')
    
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`)
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  }
})()

app.use((req,res,next)=>{
    res.send('doesnt exist')
})

const errorHandler = require('./midddlewares/errorHandler')
app.use(errorHandler)


