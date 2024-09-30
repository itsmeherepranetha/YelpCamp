const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const reviewSchema=new Schema({
    body:String,
    rating:Number,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
});

module.exports=mongoose.model("Review",reviewSchema);
// its going to be a one 2 many model
// each campground , will have many reviews
// so we will store the objectID's of reviews in the corresponding campground