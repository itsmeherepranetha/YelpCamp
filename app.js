if(process.env.NODE_ENV!=="production"){  // stores all the info in .env file in process.env , only if we are in "development" mode, and not in "production" mode
    require('dotenv').config();
}
// can access all varaibles in .env through process.env
// like process.env.SECRET or process.env.API_KEY


const express=require("express");
const path=require('path');
const mongoose=require('mongoose');
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate');
const ExpressError=require('./utils/ExpressError');
const session=require('express-session');
const flash=require('connect-flash'); // depends on express-session
// flashes are used to interact with the user , when something unique or new happens
// like when you create a new campground , flash helps in telling the user like 'Successfully created a new Campground'
// but they do not happen when you refresh
// it only happens when you are doing it the first time
const passport=require('passport');
const LocalStrategy=require('passport-local'); // just username and password(along with salt)
const User=require('./models/user.js');
const mongoSanitize = require('express-mongo-sanitize');// this library is used to prevent requests that corrupt the database , like mongo injection , like putting mongo commands , just for security purposes
// it doesnt allows keys or params or body that contain $(dollar) sign or period(.) , because these signs are usually used to write mongo commands like $gt:"pranetha" , something like that 
const helmet=require('helmet');
// helmet has some middlewares , that makes the site more secure
// helmet helps secure Express apps by setting HTTP response headers.
// but helmet has a middleware regarding content security policy , which interrupts data(like maps,locations) coming from other sources like mapTiler
// thats why disable the content security policy

const dbUrl=process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/yelp-camp' ; // this is out cloud connection to mongo
//const dbUrl='mongodb://127.0.0.1:27017/yelp-camp';

const MongoStore = require('connect-mongo'); // to store the sessions data in mongo and not locally in memory store

const campgroundsRoutes=require('./routes/campground.js');
const reviewsRoutes=require('./routes/reviews.js');
const usersRoutes=require('./routes/user.js');

// 'mongodb://127.0.0.1:27017/yelp-camp' -->our usual local mongo connection
mongoose.connect(dbUrl)
.then(()=>{console.log("MONGO CONNECTION OPEN!!!")})
.catch(e=>{console.log("OH NO MONGO CONNECTION ERROR!!!");console.log(e)})

const db=mongoose.connection;
db.on("error",console.error.bind(console,"CONNECTION ERROR!!!"));
db.once("open",()=>{console.log("DATABASE CONNECTED!!!!");});

const app=express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

//middleware
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public'))) // making 'public' directory public
app.use(mongoSanitize());

const secret=process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // in seconds // so that session data is not lost everytime we refresh and is stored in mongo for 24hrs
    crypto: {
        secret: secret
    }
});
store.on("error",function(e){console.log("STORE ERROR!!",e);})
// now if u see in mongo , a new collection called 'sessions' is created

const sessionConfig={
    store:store,
    name:'notthedefaultname', // we can change the name of the cookie from 'connect.sid' which is by default to any name , which helps in finding this cookie a bit more difficult
    secret:secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true, // for some security purposes, for avoiding client-side modifications(XSS) and some cross-scripting of cookies, also its also default
        // httpOnly:true is useful to avoid accessing of cookies through javascript, only accessible through http
        //secure:true,
        // secure:true means that the cookies only work in 'https' and not 'http' , and this is done during deployment only , since localhost is not https , and things r going to break
        expires:Date.now()+(1000*60*60*24*7),  // the cookie expires in a week from now(Date.now() is in milliseconds)
        maxAge:1000*60*60*24*7  // a week
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());
// helmet has some middlewares , that makes the site more secure
// helmet helps secure Express apps by setting HTTP response headers.
// but helmet has a middleware regarding content security policy , which interrupts data(like maps,locations) coming from other sources like mapTiler
// thats why disable the content security policy , like app.use(helmet({contentSecurityPolicy:false}));
// but another option is that, we can configure , what can be used and what not...

// saying to helmet , that data from these sources can be allowed
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls=[];
// helmet configuration , telling it what sources of data can be used
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dae38veju/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session()); // for persistent login sessions , also make sure this come after app.use(session(sessionConfig));
// what is happening here is that , we are asking passport to use a new LocalStrategy and the authentication method is there in the User model(given by default by passport-local-mongoose)
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // tells how do we store the data of the user in the session
passport.deserializeUser(User.deserializeUser()); // tells how to get the user out of that session

// middleware for flashing
// put before all the requests, since we have to run it for every single request
app.use((req,res,next)=>{
    // we are creating our own custom attribute in res.locals called success
    // if any other requets encounters this, other than the new campground request, req.flash("success"), will be empty , and nothing will happen
    // now this 'success' word can be used in ejs templates
    //console.log(req.session);
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user;
    // req.user is builtin , which gives us information about the username and email, if logged in , else its undefined
    next(); // important
})

app.get('/fakeuser',async(req,res)=>{
    const user=new User({email:'pranethacoding@gmail.com',username:'pranetha'});// username is already there by default , and also we do not put password here
    const newUser=await User.register(user,'pranetha123'); // the second argument is the password
    res.send(newUser);
    // so the User model has attributes [email,_id,username,salt,hash,__v], but we only put email , passport-local-mongoose put all the others
    // also passport does not user bcrypt, it uses PBKDF2 hashing
});

//prefix routes
app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes);
app.use('/',usersRoutes);

app.get('/',(req,res)=>{
    res.render('home');
});


// if none of the above requests are matched then this will run
// for all requests..
// next(err) , will go the next error middleware , but just next() , will go to the next middleware , not the next error middleware
app.all('*',(req,res,next)=>{
    next(new ExpressError("Page Not Found!!!",404));
});

// error handler
// this is not going to handle asynchronous error , we have to use try catch or make a separate function for that, so that it lands here
app.use((err,req,res,next)=>{
    // use the status code sent , to process the error
    // also adding the default values if they are empty , by any case , if that kind of error was not handeled
    const {statusCode=500,message}=err;
    if(!err.message)err.message="SOMETHING WENT TERRIBLY WRONG!!!";
    res.status(statusCode).render('error',{err});
});

app.listen(3000,()=>{console.log("ON PORT 3000!!!")});