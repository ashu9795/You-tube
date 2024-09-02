import mangoose ,{ Schema }from 'mongoose';
import jwt from 'jsonwebtoken'; // it is used for token.
import bcrypt from 'bcrypt'; // it is used for password hashing.
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim : true,
        index: true
        
    },
    email:{
        type: String,   
        required: true,
        unique: true,
        lowercase: true,
        trim : true,
    },
    fullname:{
        
            type: String,
            required: true,
            trim : true,
            index: true
        
    },
    avatar : {
type: String,
required: true,
    },
    coverImage : {
        type : String,
    },
    watchHistory :[
        {
            type :Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    password : {
        type: String,
        required: [true, 'Password is required'],

    
    },
    refreshToken : {
        type: String,
    
    }

},{timestamps:true});
 userSchema.pre("save",async function (next)  // it is used as middleware it is also  hook wich is used in pre of saving the data for hashing the password.
{  if(!this.isModified("password")) return next();

this.password = await bcrypt.hash(this.password, 10);
next();
})
// design custom method

userSchema.methods.isPasswordCorrect =  async function (password)
{
    return await bcrypt.compare(password, this.password);
}





userSchema.methods.generateAccessToken = function ()    //this is for cookies and sessions.
{
  return jwt.sign( {
    _id : this._id,// all these are payload which data we want to store in token.
    email : this.email,
    username : this.username,
    fullname : this.fullname,

},
process.env.ACCESS_TOKEN_SECRET, // it is used for token secret key.
{
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES // it is used for token life.
}
  )
}


userSchema.methods.generateRefreshToken = function ()

{
    return jwt.sign( {
        _id : this._id,
        
    
    },
    process.env.REFRESH_TOKEN_SECRET, // it is used for token secret key.
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES // it is used for token life.
    }
      )
}




export const User = mangoose.model('User', userSchema);