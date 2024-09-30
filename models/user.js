const mongoose=require('mongoose');
const passportLocalMongoose=require('passport-local-mongoose'); // helps interaction with mongoose
// passport-local-mongoose is only for mongoose models
const Schema=mongoose.Schema

// we actaully want email,username,password
// but passportLocalMongoose adds the username ans password by itself automatically
const UserSchema=new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
});

//adds username and password(and also the salt) to the userSchema automatically
UserSchema.plugin(passportLocalMongoose);
// it also adds some more methods too
// so the User model has attributes [email,_id,username,salt,hash,__v], but we only put email , passport-local-mongoose put all the others
// also passport does not user bcrypt, it uses PBKDF2 hashing

module.exports=mongoose.model('User',UserSchema)