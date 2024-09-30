const cloudinary=require('cloudinary').v2;  // used to store files/ like a cloud platform
const {CloudinaryStorage}=require('multer-storage-cloudinary');  // multer-storage-cloudinary , helps in sending the parsed data from multer to cloudinary

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
});

const storage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:'YelpCamp',
        allowedFormats:['jpeg','png','jpg']
    }
});

module.exports={cloudinary,storage}