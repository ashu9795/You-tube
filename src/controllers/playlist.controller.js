import asyncHandler from "../utils/asyncHandler.js";
import mongoose , {isValidObjectId}from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.models.js";
import { User } from "../models/user.model.js";
import {Video} from "../models/video.model.js"



const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId = req.user._id
     
    console.log('User ID:', userId);
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }
    if(!name ){
        throw new ApiError(400, "Name  are required")
    }
    if(!description){
        throw new ApiError(400, "Description are required")
    }
    const user = await User .findById(userId ) 
    if(!user){
        throw new ApiError(404, "User not found")
    }
    const playlist = new Playlist({
        name,
        description,
        owner : userId
    })
    await playlist.save()
    return res.status(201).json(new ApiResponce(201, "Playlist created", playlist))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }
  
    const playlists = await Playlist.find({owner: userId})

    return res.status(200).json(new ApiResponce(200, playlists, "User playlists"))
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }
    return res.status(200).json(new ApiResponce(200, playlist, "Playlist"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    console.log('Request received'); // Log when the request is received

    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId)) {
        console.log('Invalid playlist ID');
        throw new ApiError(400, "Invalid playlist id");
    }
    if (!isValidObjectId(videoId)) {
        console.log('Invalid video ID');
        throw new ApiError(400, "Invalid video id");
    }

    console.log('Finding playlist');
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        console.log('Playlist not found');
        throw new ApiError(404, "Playlist not found");
    }

    console.log('Finding video');
    const video = await Video.findById(videoId);
    if (!video) {
        console.log('Video not found');
        throw new ApiError(404, "Video not found");
    }

    console.log('Adding video to playlist');
    playlist.videos.push(videoId);
    await playlist.save();

    console.log('Video added, saving playlist');
    return res.status(200).json(new ApiResponce(200, playlist, "Video added to playlist"));
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate playlistId and videoId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    // Find the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
   
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }





    // Check if the video exists in the playlist
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(404, "Video not found in playlist");
    }

    // Use Mongoose's pull method to remove the video from the array
    playlist.videos.pull(videoId);
    await playlist.save();

    return res.status(200).json(new ApiResponce(200, playlist, "Video removed from playlist"));
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Validate playlist ID
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    // Find and delete the playlist in one step
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    // Check if the playlist was found and deleted
    if (!playlist) {
        throw new ApiError(404, "Playlist not found or could not be deleted");
    }

    // Respond with success message
    return res.status(200).json(new ApiResponce(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    if(!name){
        throw new ApiError(400, "Name is required")
    }
    if(!description){
        throw new ApiError(400, "Description is required")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {$set :{name, description}}, {new: true})

    return res.status(200).json(new ApiResponce(200, updatedPlaylist, "Playlist updated successfully"))
    
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}