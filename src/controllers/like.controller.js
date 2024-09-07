import mongoose,{isValidObjectId} from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { Like } from "../models/likes.models.js";
import { Comment } from "../models/comments.model.js";
import { Tweet } from "../models/tweets.models.js";
import { Video } from "../models/video.model.js";



const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });
    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(201).json(new ApiResponce(201, existingLike, "Video unliked successfully"));
    }

    const newLike = new Like({ video: videoId, likedBy: userId });
    await newLike.save();
    return res.status(201).json(new ApiResponce(201, newLike, "Video liked successfully"));
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }
    if(!userId){
        throw new ApiError(401, "Unauthorized")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }
    const existingLike = await Like.findOne ({comment: commentId, likedBy: userId})
    if(existingLike){
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(201).json(new ApiResponce(201, existingLike, "Comment unliked successfully"));
    }
    const newLike = new Like({comment: commentId, likedBy: userId})
    await newLike.save()
    return res.status(201).json(new ApiResponce(201, newLike, "Comment liked successfully"));


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user._id
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID")
    }
    if(!userId){
        throw new ApiError(401, "Unauthorized")
    }
    const tweet = await Tweet .findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }
    const existingLike = await Like.findOne ({tweet: tweetId, likedBy: userId})
    if(existingLike){
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(201).json(new ApiResponce(201, existingLike, "Tweet unliked successfully"));
    }
    const newLike = new Like({tweet: tweetId, likedBy: userId})
    await newLike.save()
    return res.status(201).json(new ApiResponce(201, newLike, "Tweet liked successfully"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const likedVideos = await Like.aggregate([
        { $match: { likedBy: userId, video: { $exists: true } } },
        { 
            $lookup: {
                from: "videos",         // the name of the "Video" collection
                localField: "video",     // field in the Like collection
                foreignField: "_id",     // field in the Video collection
                as: "videoDetails"       // output array field name
            }
        },
        { $unwind: "$videoDetails" }    // unwind to convert the array to an object
    ]);

    return res.status(200).json(new ApiResponce(200, likedVideos, "Liked videos fetched successfully"));
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}