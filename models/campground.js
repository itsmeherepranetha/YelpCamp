const mongoose=require('mongoose');
const Review=require('./review');
const Schema=mongoose.Schema;

const ImageSchema=new Schema({
    url:String,
    filename:String
});
// adding a virtual attribute
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200');
});
// see in cloudinary image transformation
// replacing in the url , /upload , as /upload/w_200
//we are doing this , since when a user uploads any number of images, the images acn be of different sizes
// so to standardize , we are creating a thumbnail kind of a thing
// in the cloudinary url , if u see , u can add an attribute after the /upload in the link , called as /w_200 or /w_400 to specify its width
// instaed of storing we can create a virtual property , since we are not using anything new data

const opts={toJSON:{virtuals:true}};
// this is because , mongoose by default , does not send the virtual properties data , when converted to JSON

const CampgroundSchema=new Schema({
    title:String,
    images:[ImageSchema],
    // this geometry object is taken from the format of Maptiler geometry object
    geometry:{
        type:{
            type:String,
            enum:['Point'], // basically it has to be of type "Point"
            required:true
        },
        coordinates:{  // like [longitude,latitude] , note the order of coordinates
            type:[Number],
            required:true
        }
    },
    price:Number,
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
},opts); // have to include the options

//virtual property, to show the campground , when presses on that single unclustered campground
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

//deleting middleware,after the campground is deleted , but we will have the campground info present in the argument
// when a campground is deleted , we have to delete all its references of reiews also
// this is a type of query middleware
CampgroundSchema.post('findOneAndDelete',async(deletedCamp)=>{
    if(deletedCamp){await Review.deleteMany({_id:{$in: deletedCamp.reviews}});} //deleted all the reviews in the review collections that were associated with the campground
});

module.exports=mongoose.model('Campground',CampgroundSchema);