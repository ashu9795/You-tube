import asyncHandler from '../utils/asyncHandler.js' // this is for web request
import { ApiError } from '../utils/ApiError.js';
import {User} from '../models/user.model.js'
import uploadCloudinary from '../utils/cloudnary.js'
import {ApiResponce} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken' // for generating token


//Method for generating access and refresh token

const generateAccessAndRefreshToken = async(userId) =>
{
    try {
       const user =  await User.findById(userId)
     const accessToken =   user.generateAccessToken()          //all these function is declared in user.model.js
      const refreshToken =  user.generateRefreshToken()   // we give access token to user but we store refresh token in db and user
               
//       console.log("Access Token:", accessToken);  // Debugging
// console.log("Refresh Token:", refreshToken);  // Debugging
        user.refreshToken = refreshToken
        await   user.save({validateBeforeSave:false}) // it is used for not to validate the data before saving it.  
        return {accessToken,refreshToken}


    } catch (error) {
        throw new ApiError(500,"Error generating tokens") 
    }
}





const registerUser = asyncHandler(async (req, res) => {
    // get user details
    // validtaion  not empty
    // check if user already exists
    //check for images and for avtar
    //upload them on cloudinary, avtar
    // create user object - create entry in db
    // remove password and refrshs token feild
    // check for user cretaion 
    // return rsponse


    //for user details
     const {fullname,email,username,password} =req.body

     console.group("email",email); // Debugging
     if(fullname=="")
     {
throw new ApiError(400,"Full Name is required")

     }
        if(email=="")
        {
            throw new ApiError(400,"Email is required")
        }
        if(username=="")
        {
            throw new ApiError(400,"Username is required")
        }
        if(password=="")
        {
            throw new ApiError(400,"Password is required")
        }

        // to find if the existing user
 const existedUser = await User.findOne({
    $or: [{username}, {email}]
})
if(existedUser)
{
    throw new ApiError(409,"User already exists")
}

// image handling
 
 const avatarLocalPath = req.files?.avatar[0]?.path

// const coverImageLocalPath = req.files?.coverImage[0]?.path

//by other way
let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)

    {
        coverImageLocalPath = req.files.coverImage[0].path
    }
if(!avatarLocalPath)
{
    throw new ApiError(400,"Avatar is required")
}

//upload on cloudinary

 const avatar = await  uploadCloudinary(avatarLocalPath)

const coverImage = await uploadCloudinary(coverImageLocalPath)
 if(!avatar)
 {
     throw new ApiError(400,"Error uploading avatar")
 }

 const user =  await User.create({
     fullname,
     email,
     username : username.toLowerCase(),
     password,
     avatar : avatar.url, // because in clodinary file we are returnin complete response but only we require url
     coverImage : coverImage?.url||""
 })
// for findind user if created or not
   const createdUser =  await User.findById(user._id).select("-password -refreshToken")// it will remove which is written
   

    if(!createdUser)
    {
         throw new ApiError(500,"User not created")
    }

// Simplify the response object
const simplifiedUser = {
    id: createdUser._id,
    fullname: createdUser.fullname,
    email: createdUser.email,
    username: createdUser.username,
    avatar: createdUser.avatar,
    coverImage: createdUser.coverImage
};




return res.status(201).json(new ApiResponce(201, simplifiedUser, "User created successfully"));
});

// const loginUser = asyncHandler(async (req, res) => {
//   //get user details
//   // username or email
//   // find the user
//   //password check 
//   //access and refresh token
//     // send them in form cookies
//     // return response

//     const {username, password,email} = req.body;

//     if(!(email || username))
//     {
//         throw new ApiError(400,"Email and UserName is required")
//     }
    
//  const user =await User.findOne({$or: [{username}, {email}]}) // it will find user by username or email

//     if(!user)
//     {
//         throw new ApiError(404,"User not found")
//     }

// const isPasswordValid=  await user.isPasswordCorrect(password)

// if(!isPasswordValid)
// {
//     throw new ApiError(400,"Invalid user credentials")
// }

//  const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id) // by the function

// // now we have to update the user because in user we do not accsess and refresh so we have to put or we do not want that password will we gien for that

// // we can overwrite or we can call database one more time.

//  const loggedInUser = User.findById(user._id).select("-password -refreshToken")
//  // for cookies

//  const options = {
//     httpOnly: true, // to prevent cookies access from client side

//     secure : true // only for https
//  }

//  return res
//  .status(200)
//  .cookie("accessToken",accessToken,options)
//  .cookie("refreshToken",refreshToken,options)
//  .json(new ApiResponce(200,{
//     user : loggedInUser, accessToken, refreshToken   // we are sending user and token
//  },"User logged in successfully"))


// })

const loginUser = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;

    if (!(email || username)) {
        throw new ApiError(400, "Email or Username is required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const simplifiedUser = {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        coverImage: user.coverImage
    };

    return res.status(200)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
        .json(new ApiResponce(200, { user: simplifiedUser, accessToken, refreshToken }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
 User.findByIdAndUpdate(req.user._id,{$unset : {
    refreshToken : 1 // we are removing the refresh token
 }

}
,
{
    new : true
},


) // we are removing the refresh token
const options = {
    httpOnly: true, // to prevent cookies access from client side

    secure : true // only for https
 }
 return res.status(200)
 .clearCookie("accessToken",options)
 .clearCookie("refreshToken",options)
    .json(new ApiResponce(200,{}, "User logged out successfully"))

})

// end point for refresh token

const refreshAccessToken = asyncHandler(async (req, res) => {
     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken //( body is for mobile app)    this is used to find  the refresh token from the cookies or from the body

     if(!incomingRefreshToken)
     {
         throw new ApiError(401,"UnAuthorised request")
     }
 // verify the refresh token

 try {
     const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
      
      
      ) 
      const user = await  User.findById(decodedToken?._id) // refersh token conatian id from id we are finding the details of USer from Mongodb
   
      if (!user) {
       throw new ApiError(404,"INvalid Refresh Token");
   
      }
   
      if(user.refreshToken !== incomingRefreshToken)  // if the refresh token is not same as the token which is stored in the database
       
      {
          throw new ApiError(401,"Invalid Refresh Token")
      }
   
       // if the token is valid then we have to generate the access token and refresh token
       const options = {
           httpOnly: true, // to prevent cookies access from client side
       
           secure : true // only for https
   
           // they are for cookeis;
   
   
        }
   
    const { accessToken,newrefreshToken}= await   generateAccessAndRefreshToken(user._id)
   return res.status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newrefreshToken,options)
   .json(new ApiResponce(200,{accessToken,newrefreshToken}, "Token Refreshed Successfully"))
   
 } catch (error) {
    throw new ApiError(401,error?.message||"Invalid Refresh Token")
 }

})

const changePassword = asyncHandler(async(req,res) => {
    const {oldPassword, newPassword} = req.body; // jo jo chahiye wo body se lelo
     const user = await User.findById(req.user._id) // we are finding the user from the id  kyui agr wo password chage krr pa rha to wo login hoga or agar login hoga to middleware se hoke jayega to uska id hoga
     const isPasswordCorrect= await user.isPasswordCorrect(oldPassword) // we are checking the password
        if(!isPasswordCorrect)
        {
            throw new ApiError(400,"Invalid old password")
        }
        user.password = newPassword // we are changing the password
        await user.save({validateBeforeSave: false}) // we are saving the password

        return res.status(200).json(new ApiResponce(200,{}, "Password changed successfully")) // we are sending the response

})

const getCurrentUser = asyncHandler(async(req,res) => {
    const user = await User.findById(req.user) // we are finding the user from the id
    return res.status(200).json(new ApiResponce(200,user, "User details fetched successfully")) // we are sending the response

})

const updateAccoutDetails = asyncHandler(async(req,res) => {
    const {fullname, email} = req.body; // we are taking the data from the body
    if(!fullname || !email) // if the data is not there
    {
        throw new ApiError(400,"Details  are required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id, // we are finding the user from the id
        {
            $set:{
                fullname,
                email
            }

        },
        {
            new : true// update hone ke baad jo information hogi wo milega
        },
        
    ).select("-password ") // we are removing the password 

    return res.status(200).json(new ApiResponce(200,user, "User details updated successfully")) // we are sending the response
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path // we are taking the path of the file

    if(!avatarLocalPath) // if the path is not there
    {
        throw new ApiError(400,"Avatar is required")
    }

     const avatar = await  uploadCloudinary(avatarLocalPath) // we are uploading the file on the cloudinary
     if(!avatar.url) // if the file is not uploaded
     {
         throw new ApiError(400,"Error uploading on  avatar")
     }
      // Check if there is an existing avatar
        // const publicId = user.avatar.split('/').pop().split('.')[0]; // Extract the public_id from the URL
        // await deleteCloudinary(publicId); // Delete the old avatar from Cloudinary
    


     const user =  await User.findByIdAndUpdate(req.user._id, // we are finding the user from the id
        {
            $set:{
                avatar : avatar.url // we are updating the avatar beacuse thumbnail is string type so we hve to put only url
            }

        },
        {
            new : true// update hone ke baad jo information hogi wo milega
        },

    )



    return res.status(200).json(new ApiResponce(200,user, "Avatar updated successfully")) // we are sending the response
})

const updateUserCover = asyncHandler(async(req,res) => {
    const coverLocalPath = req.file?.path // we are taking the path of the file

    if(!coverLocalPath) // if the path is not there
    {
        throw new ApiError(400,"Avatar is required")
    }

     const coverImage = await  uploadCloudinary(coverLocalPath) // we are uploading the file on the cloudinary
     if(!coverImage.url) // if the file is not uploaded
     {
         throw new ApiError(400,"Error uploading on  CoverImage")
     }

     const user =  await User.findByIdAndUpdate(req.user._id, // we are finding the user from the id
        {
            $set:{
                coverImage : coverImage.url // we are updating the avatar beacuse thumbnail is string type so we hve to put only url
            }

        },
        {
            new : true// update hone ke baad jo information hogi wo milega
        },

    )

    return res.status(200).json(new ApiResponce(200,user, "coverImage updated successfully")) // we are sending the response
})

const getUserChannelProfile = asyncHandler(async(req,res) => {
// profile use url se milta hai to hum se krenge prams naki body se
 const {username} = req.params // we are taking the username from the params

 if(!username?.trim()) // if the username is not there
 {
     throw new ApiError(400,"Username is required")
 }
 const channel = await User.aggregate([
    {
        $match : {
          username : username?.toLowerCase() // we are finding the user from the username

        }

    },
    {
        $lookup : {
            from : "subscriptions",
            localField : "_id",
            foreignField : "channel", // sare channel cooman honage to subscriber niklega
            as : "subscribers"
        }
    },
    {
        $lookup : {
            from : "subscriptions",
            localField : "_id",
            foreignField : "subscriber", // sare subscriber cooman honage to subscriber niklega
            as : "subscribedTo"
        }
    },
    {
        $addFields : {
            subscribersCount : {
                $size : "$subscribers"
            },  
            subscribedToCount : {
                $size : "$subscribedTo"
            },
            isSubscribed : {
                $if : { $in :[req.user?._id,"$subscribers.subscriber"]}, //
                then : true,
                else : false
            }
        }
    },
    {
                $project : {    // we are selecting the fields which we want to show to the user    
                    fullname : 1,
                    email : 1,
                    username : 1,
                    avatar : 1,
                    coverImage : 1,
                    subscribersCount : 1,
                    subscribedToCount : 1,
                    isSubscribed : 1

                }
    }
    

 ]) // we are finding the user from the username
    
  if(!channel?.length) // if the channel is not there 
  {
      throw new ApiError(404,"Channel not found")
  }
 console.log(channel); // Debugging
return res.status(200).json(new ApiResponce(200,channel[0], "Channel fetched successfully")) // we are sending the response
})

const getWatchHistory = asyncHandler(async(req,res) => {
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id) // we are finding the user from the id   this is syntax for finding the id from the mongodb in mongoose
            }
        },
        {
            $lookup:{
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : [
                    {
                        $lookup : {   // we are joining the videos with the user
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [{
                                $project : {
                                    fullname : 1,
                                    username : 1,
                                    avatar : 1
                                }

                            }]
                        }
                    },
                    {
                        $addFields:{
                            owner : {
                                $first : "$owner"   // we are taking the first owner from the owner array because we are getting the array of owner
                            }
                        }
                    }

                ]
            }
        }

    ])
//  console.log(user); // Debugging
//  console.log(user[0].watchHistory); // Debugging
    return res.status(200).json(new ApiResponce(200,user[0].watchHistory, "Watch History fetched successfully")) // we are sending the response

})


export { registerUser, loginUser, logoutUser ,refreshAccessToken, changePassword, getCurrentUser, updateAccoutDetails, updateUserAvatar,updateUserCover, getUserChannelProfile, getWatchHistory }; // we are exporting the functions 



