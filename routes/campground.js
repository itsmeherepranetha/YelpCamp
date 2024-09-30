const express=require('express');
const router=express.Router();
const catchAsyncErrors=require('../utils/catchAsyncErrors');
const campgrounds=require('../controllers/campgrounds.js');
const {isLoggedIn,validateCampground,isAuthor}=require('../middleware.js');
const multer  = require('multer');  // used to parse file data like images , just like what app.use(express.urlencoded({extended:true})) is used to parse text data sent to req
const {storage}=require('../cloudinary/index.js');
const upload = multer({storage});  // specified location to store the file data, can be local storage or cloud storage or some other tools


//we can group all the routes with the same link , but different requests , using router.route()
router.route('/')
.get(catchAsyncErrors(campgrounds.index))
.post(isLoggedIn,upload.array('image'),validateCampground,catchAsyncErrors(campgrounds.createCampground))
// the argument 'image' is the word used in the name of the form for image uploading in new.ejs
// upload.array('image') must be before validateCampground , since it has to upload images , and then validate , but in production this is not good idea

//we can protect this route so that an unauthenticated user can't access it
// using passport methods , which takes care of the session storages and easily gives us a method to use...
router.get('/new',isLoggedIn,campgrounds.renderNewForm);

router.route('/:id')
.get(catchAsyncErrors(campgrounds.showCampground))
.put(isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsyncErrors(campgrounds.updateCampground))
.delete(isLoggedIn,isAuthor,catchAsyncErrors(campgrounds.deleteCampground))
//when we delete the campground, then you have to delete all the reviews and also the references of reviewIDs present

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsyncErrors(campgrounds.renderEditForm));

module.exports=router;