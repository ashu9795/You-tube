import mongoose from "mongoose"
import {isValidObjectId} from "mongoose"
import {Comment} from "../models/comments.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponse.js"
import asyncHandler from "..//utils/asyncHandler.js"
import {Video} from "../models/video.model.js"



const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Create a new comment
    const comment = new Comment({
        content,
        video: videoId,
        owner: userId,  // Ensure the field name matches the model
    });

    // Save the comment
    await comment.save();

    // Return the response
    res.status(201).json(new ApiResponce(201, comment, "Comment added"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

   let comment = await Comment.findOne({ _id: commentId, owner: userId });





    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
  

    comment = await Comment .findByIdAndUpdate  (commentId, { $set :{ content }}, { new: true });

    

    res.json(new ApiResponce(200, comment, "Comment updated"));

})

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
 const pageValue = Math.max(1, parseInt(page));
const limitValue = Math.max(1, Math.min(limit, 100));

const filter = {}
if(isValidObjectId(userId)){
    filter.owner = userId
}

const comment = await Comment.find(filter)

    .limit(limitValue)
    .exec();

const count = await Comment.countDocuments(filter);

return res.status(200).json(new ApiResponce(200, { comment, count }, "Comments fetched successfully"));





})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const comment = await Comment.findOne({ _id: commentId, owner: userId });

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    await Comment.findByIdAndDelete(commentId);

    res.json(new ApiResponce(200, null, "Comment deleted"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }