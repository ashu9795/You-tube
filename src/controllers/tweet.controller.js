import mongoose , {isValidObjectId} from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import {User} from "../models/user.model.js";
import {Tweet} from "../models/tweets.models.js";

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;
    const userId = req.user._id;


 if(!isValidObjectId(userId)){         // it is used for checking the id is valid or not.
     throw new ApiError(400, "Invalid user id");
    }

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404, "User not exist for tweet ");
    }
    if(content == ""){
        throw new ApiError(400, "Content is required");
    }
const tweet = await Tweet.create({
    owner : req.user._id,
    content,
});

if(!tweet){
    throw new ApiError(400, "Tweet not created");
}

return res.status(201).json(new ApiResponce(201, tweet, "tweet created successfully"));



})

const getUserTweets = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user);
    if (!user) {
        throw new ApiError(404, "User not exist for tweet");
    }

    const tweet = await User.aggregate([
      
        {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "tweets"
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                email: 1,
                tweets: 1
            }
        }
    ]);

    if (!tweet || tweet.length === 0) {
        throw new ApiError(404, "Tweet not found");
    }

    return res.status(200).json(new ApiResponce(200, tweet, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const tweetId = req.params.id;
    const userId = req.user._id;

    // Validate tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Validate content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    // Find the tweet and ensure the user is the owner
    let tweet = await Tweet.findOne({ _id: tweetId, owner: userId });

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or not authorized to update");
    }
     tweet = await Tweet.findByIdAndUpdate(tweetId,
        { $set : {content}}, {new: true});

    if(!tweet){
        throw new ApiError(400, "Tweet not updated");
    }

    return res.status(200).json(new ApiResponce(200, tweet, "Tweet updated successfully"));

   

    

})

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.id;
    const userId = req.user._id;

    // Validate tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Validate userId
    if (!userId) {
        throw new ApiError(400, "Invalid user ID");
    }

    // Find the tweet
    const tweet = await Tweet.findOne({ _id: tweetId, owner: userId });

    // Check if the tweet exists and if the user is authorized to delete it
    if (!tweet) {
        throw new ApiError(404, "Tweet not found or not authorized to delete");
    }

    // Delete the tweet
    await Tweet.findByIdAndDelete(tweetId);

    // Send a response
    return res.status(200).json(new ApiResponce(200, {}, "Tweet deleted successfully"));
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}