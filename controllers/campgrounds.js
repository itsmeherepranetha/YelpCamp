const Campground=require('../models/campground.js');
const {cloudinary}=require('../cloudinary/index.js');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index=async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm=(req,res)=>{
    res.render('campgrounds/new');
}

module.exports.createCampground=async(req,res,next)=>{
    //using maptiler api
    // the limit , is the number of most appropriate locations that the user/location is referring to in maps
    // we will take the most appropriate one , so limit:1
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location,{limit:1}); // only the most appropriate location is needed
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.images=req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.author=req.user._id;
    //res.send(geoData);
    //console.log(geoData.features);
    await campground.save();
    req.flash('success','Successfully made a new campground!!!'); // 'success' is the key , 'Successfully made a new Campground!!!' is the value
    // now we have to display this flash in the template , which is the below link , '/campgrounds/:whateverid'
    // then in the below route , along with campground , we also have to send msg:req.flash("success");
    // but instaed of doing this(since we have to do it for anything new happens) , we will create a middleware
    // also just do it before redirecting
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground=async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }}).populate('author');
    //we are popualting the reviews , along with the author of the review
    // also separately populating the author of the campround itself
    //console.log(campground);
    if(!campground){
        req.flash('error','Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground});
}

module.exports.renderEditForm=async(req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find the campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}

module.exports.updateCampground=async(req,res)=>{
    const {id}=req.params;
    //console.log(req.body);
    const newCampground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location,{limit:1});
    newCampground.geometry = geoData.features[0].geometry;
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}));
    newCampground.images.push(...imgs);
    await newCampground.save();
    if(req.body.deleteImages)// delete some images if user wants
    {
        const imagesToDelete=req.body.deleteImages;
        for(let filename of imagesToDelete)//deleting from cloudinary
        {
            await cloudinary.uploader.destroy(filename);
        }
        // deleting from mongo also
        await newCampground.updateOne({$pull:{images:{filename:{$in:imagesToDelete}}}});
    }
    req.flash('success','Successfully updated the campground!!!');
    res.redirect(`/campgrounds/${newCampground._id}`);
}

module.exports.deleteCampground=async(req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);  // which triggers findOneAndDelete in middleware
    // if u use some other method to delete , then it may not trigger the middleware
    req.flash('success','Successfully deleted the campground!!!');
    res.redirect('/campgrounds');
}