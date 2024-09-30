const express=require('express');
const router=express.Router();
const catchAsyncErrors=require('../utils/catchAsyncErrors');
const passport=require('passport');
const {storeReturnTo} = require('../middleware.js');
const users=require('../controllers/users.js')

router.route('/register')
.get(users.renderRegister)
.post(catchAsyncErrors(users.register))
// also when a user registers , we also want the user to be by default logged in

router.route('/login')
.get(users.renderLogin)
.post(storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.login)
// passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}) is a builtin middleware by passport
// 1st argument is the type of authentication, it could be google,facebook etc...but now we are doing local, like our own username and password
// and also telling that if something wrong happens flash it and redirect to login page

router.get('/logout',users.logout);

module.exports=router;