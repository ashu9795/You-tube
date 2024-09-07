import asyncHandler from "../utils/asyncHandler.js";
import mongoose , {isValidObjectId}from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscripition.models.js";
import { User } from "../models/user.model.js";
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { subscriberId } = req.body;

    // Validate IDs
    if (!isValidObjectId(channelId) || !isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid id");
    }

    // Check if channel and subscriber exist
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    const subscriber = await User.findById(subscriberId);
    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found");
    }

    // Check for existing subscription
    const existingSubscription = await Subscription.findOne({ 
        channelId: channelId, 
        subscriberId: subscriberId 
    });
    
    if (existingSubscription) {
      
        const result = await Subscription.deleteOne({ _id: existingSubscription._id });
        
        return res.status(200).json(new ApiResponce(200, existingSubscription, "Unsubscribed successfully"));
    }

    // Create new subscription
    const newSubscription = new Subscription({ channelId, subscriberId });
    await newSubscription.save();
    return res.status(201).json(new ApiResponce(201, newSubscription, "Subscribed successfully"));
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid id");
    }
    
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    

    const subscribers = await Subscription.find({ channelId: channelId })
    .populate({
        path: "subscriberId",
        select: "-password -createdAt -updatedAt -__v -refreshToken" // Exclude fields
    })
    .select("-password -createdAt -updatedAt -__v -refreshToken");
    
 
    
    return res.status(200).json(new ApiResponce(200, subscribers, "Subscribers list"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid id")
    }
    const subscriber = await User.findById(subscriberId)
    if(!subscriber){
        throw new ApiError(404, "Subscriber not found")
    }
    const channels = await Subscription.find({subscriberId: subscriberId})
    .populate({
        path: "channelId",
        select: "-password -createdAt -updatedAt -__v -refreshToken" // Exclude fields
    })
    .select("-password -createdAt -updatedAt -__v -refreshToken");
    return res.status(200).json(new ApiResponce(200, channels, "Subscribed channels list"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}