const Campground=require('../models/campground.js');
const Review=require('../models/review.js');

module.exports.createReview=async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    const review=new Review(req.body.review);
    review.author=req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Created a new review!!!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview=async(req,res)=>{
    const {id,reviewID}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewID}});//removing that objectid of the review inside the campground
    // 'pull' removes the reviewID present in an array of reviewID's present in the campground
    await Review.findByIdAndDelete(reviewID);
    req.flash('success','Successfully deleted your review!!!');
    res.redirect(`/campgrounds/${id}`);
}

