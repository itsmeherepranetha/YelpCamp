const mongoose=require('mongoose');
const cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');
const Campground=require('../models/campground');
  
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(()=>{console.log("MONGO CONNECTION OPEN!!!")})
.catch(e=>{console.log("OH NO MONGO CONNECTION ERROR!!!");console.log(e)})

const db=mongoose.connection;
db.on("error",console.error.bind(console,"CONNECTION ERROR!!!"));
db.once("open",()=>{console.log("DATABASE CONNECTED!!!!");});

const sample= array=>array[Math.floor(Math.random()*array.length)];

const seedDB=async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<200;i++)
    {
        const rand=Math.floor(Math.random()*1000);
        const camp=new Campground({
            author:'66e6929f43b6dc09f59e677c',
            location:`${cities[rand].city}, ${cities[rand].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut eu turpis elit. Phasellus condimentum luctus elit venenatis viverra. Donec et massa feugiat orci facilisis tempus at sed eros. Nunc et porta odio. Donec quam neque, eleifend ullamcorper eleifend eu, viverra eget ligula. In at arcu ac ipsum efficitur sagittis.',
            price:Math.floor(Math.random()*20)+10,
            geometry:{
              type:"Point",
              coordinates:[cities[rand].longitude,cities[rand].latitude]
            },
            images:[
                {
                  url: 'https://res.cloudinary.com/dae38veju/image/upload/v1727083879/YelpCamp/jkbqofynhifmtovkp8ww.jpg',
                  filename: 'YelpCamp/jkbqofynhifmtovkp8ww'
                },
                {
                  url: 'https://res.cloudinary.com/dae38veju/image/upload/v1727083878/YelpCamp/knurzi2t5fxax1jxrnul.jpg',
                  filename: 'YelpCamp/knurzi2t5fxax1jxrnul' 
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(()=>{mongoose.connection.close();})