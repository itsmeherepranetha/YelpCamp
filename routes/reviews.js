const express=require('express');
const router=express.Router({mergeParams:true}); // {mergeParams:true} because the 'id' present in the prefix is not accessible here if mergeParams is false(by default)
//its not a problem in the campground.js route , since all the id's are defined in the suffixes only
const catchAsyncErrors=require('../utils/catchAsyncErrors');
const {validateReview,isLoggedIn,isAuthorOfReview}=require('../middleware.js');
const reviews=require('../controllers/reviews.js');

router.post('/',isLoggedIn,validateReview,catchAsyncErrors(reviews.createReview));

//we want to remove not only the review , but also the reference to it
router.delete('/:reviewID',isLoggedIn,isAuthorOfReview,catchAsyncErrors(reviews.deleteReview));

module.exports=router;