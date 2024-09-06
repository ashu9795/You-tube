import asyncHandler from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import uploadCloudinary from "../utils/cloudnary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'asc', userId } = req.query;
 


    const pageValue = Math.max(1, parseInt(page));
    const limitValue = Math.max(1, Math.min(limit, 100));
    const sortOrder = sortType === 'desc' ? -1 : 1;

    let filter = {};

    // Validate userId
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user id");
        }
        filter.owner = userId;
    }

    // Search query filter
    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }



    // Fetch only the necessary fields: title, videoFile (video link), and thumbnail
    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortOrder })
        .select('title videoFile thumbnail')  // Fetch video link (videoFile) and title
        .limit(limitValue)
        .skip((pageValue - 1) * limitValue)
        .exec();

    const count = await Video.countDocuments(filter);

    return res.status(200).json(new ApiResponce(200, { videos, count }, "Videos fetched successfully"));
});



const publishAVideo = asyncHandler(async (req, res) => {
   try {
     
 
         const { title, description } = req.body;
         const userId = req.user._id;
 
         if (!isValidObjectId(userId)) {
             throw new ApiError(400, "Invalid user id");
         }
 
         const user = await User.findById(userId);
         if (!user) {
             throw new ApiError(404, "User not exist for video");
         }
 
         if (!title) {
             throw new ApiError(400, "Title is required");
         }
 
         if (!description) {
             throw new ApiError(400, "Description is required");
         }
 
         if (!req.files || !req.files.videoFile || !req.files.videoFile[0]) {
             throw new ApiError(400, "Video is required");
         }
 
         if (!req.files.thumbnail || !req.files.thumbnail[0]) {
             throw new ApiError(400, "Thumbnail is required");
         }
 
         const videoPath = req.files.videoFile[0].path;
         const thumbnailPath = req.files.thumbnail[0].path;
 
         const video = await uploadCloudinary(videoPath);
// console.log("Video upload response:", video);
const thumbnail = await uploadCloudinary(thumbnailPath);
// console.log("Thumbnail upload response:", thumbnail);

 
         const newVideo = new Video({
             title,
             description,
             owner: userId,
             videoFile: video.url,
             thumbnail: thumbnail.url,
             views: 0,   //todo
             isPublished: true,
             duration: 0  // todo
         });
 
         await newVideo.save(); 
 
         return res.status(201).json(new ApiResponce(201, newVideo, "Video published successfully"));
   } catch (error) {
       throw new ApiError(400, error.message);
   }
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    console.log("videoId", videoId);
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
   const video = await Video.findById(videoId)
   .select('title description videoFile thumbnail views createdAt')
   
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    return res.status(200).json(new ApiResponce(200, video, "Video fetched successfully"));


})
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const userId = req.user._id;
    const thumbnaillocal = req.file && req.file.path;


    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    if (!title && !description) {
        throw new ApiError(400, "Title and description are required");
    }

    

    const video = await Video.findOne({ _id: videoId, owner: userId });
    if (!video) {
        throw new ApiError(404, "Video not found or not authorized to update");
    }

    


    const updatedVideo = await Video.findOneAndUpdate(
        { _id: videoId, owner: userId },
        { $set: { title, description,  thumbnail: thumbnaillocal 
            ? (await uploadCloudinary(thumbnaillocal)).url 
            : video.thumbnail } },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(400, "Video not updated");
    }

    return res.status(200).json(new ApiResponce(200, updatedVideo, "Video updated successfully"));
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
     const video = await Video.findOne({ _id: videoId, owner: userId })
   
    if (!video) {
        throw new ApiError(404, "Video not found or not authorized to delete");

    }
    await Video.findByIdAndDelete(videoId);
    return res.status(200).json(new ApiResponce(200, {}, "Video deleted successfully"));

})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
  
}