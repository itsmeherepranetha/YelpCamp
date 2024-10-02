const User=require('../models/user.js');

module.exports.renderRegister=(req,res)=>{
    res.render('users/register.ejs');
}

module.exports.register=async(req,res,next)=>{
    try{
        const {email,username,password}=req.body;
        const user=new User({email,username});
        const registeredUser=await User.register(user,password); // it hashes and also salts on its own
        // so if the user has registered, by default he is logged in
        req.login(registeredUser,err=>{
            if(err)return next(err);
            req.flash('success','Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    }
    catch(e)
    {
        req.flash('error',e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin=(req,res)=>{
    res.render('users/login');
}

module.exports.login=(req,res)=>{
    req.flash('success','Welcome Back!!');
    console.log("logged innnnn");
    const redirectUrl=res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logout=(req,res,next)=>{
    //the argument must be a callback function which handles the error
    req.logout(function(err){
        if(err){return next(err);}
        req.flash('success','You are successfully logged out!!');
        res.redirect('/campgrounds');
    });
}