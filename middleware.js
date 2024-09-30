const {CampgroundSchema,reviewSchema}=require('./validationSchema.js');
const ExpressError=require('./utils/ExpressError.js');
const Campground=require('./models/campground.js');
const Review=require('./models/review.js');

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated())
    {
        //console.log(req.path,req.originalUrl);
        // suppose you want to go to new campground
        // req.path will be /new ..
        // but req.originalUrl will be /campgrounds/new
        // so we are interested in req.originalUrl
        // lets store it in the session ,with an aatribute returnTo
        req.session.returnTo=req.originalUrl;
        req.flash('error','You must be signed in first!!');
        return res.redirect('/login');
    }
    next();
}


// storing the request of the user , before he was asked to log in , so that after the user is logged in ,we can redirect them to that page itself
module.exports.storeReturnTo =(req,res,next)=>{
    if (req.session.returnTo)
    {
        res.locals.returnTo = req.session.returnTo; // this returnTo is created in the above middleware
        // we are doing this since , after the user is logged in , passport by default erases all the session data, so thats why we have to store it in locals
    }
    next();
}

// middleware to take care of server side errors, and ensuring stupid stuff is not written
module.exports.validateCampground=(req,res,next)=>{
    const {error}=CampgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(element=>element.message).join(',');
        throw new ExpressError(msg,400);
    }
    else{
        next(); // calling the catchAsyncError/ basically the next argument
    }
}

// to check if the logged in user is the author of the campground
module.exports.isAuthor=async(req,res,next)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    // only the author can edit
    // we are doing this even if the edit button is not there for the user , he can still manually type or through postman , do  put request
    if(!campground.author.equals(req.user._id))
    {
        req.flash('error','You do not have permission to edit this campground');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// middleware to take care of the server side errors involved in reviews
module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(element=>element.message).join(',');
        throw new ExpressError(msg,400);
    }
    else{
        next(); // calling the catchAsyncError/ basically the next argument
    }
}

// to check if the logged in user is the author of the review
module.exports.isAuthorOfReview=async(req,res,next)=>{
    const {id,reviewID}=req.params;
    const review=await Review.findById(reviewID);
    // only the author of the review can delete the review
    // we are doing this even if the delete button is not there for the user , he can still manually type or through postman , do delete request
    if(!review.author.equals(req.user._id))
    {
        req.flash('error','You do not have permission to delete this campground');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}