import mongoose from "mongoose";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { toggleCommentLike,toggleTweetLike,toggleVideoLike,getLikedVideos} from "../controllers/like.controller.js"

const router = Router();
router.route("/comment/:commentId").post(verifyJWT, toggleCommentLike);
router.route("/tweet/:tweetId").post(verifyJWT, toggleTweetLike);
router.route("/video/:videoId").post(verifyJWT, toggleVideoLike);
router.route("/videos").get(verifyJWT, getLikedVideos);


export default  router;
