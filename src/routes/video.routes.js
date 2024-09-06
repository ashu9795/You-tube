import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { publishAVideo ,getAllVideos, getVideoById,updateVideo,deleteVideo} from "../controllers/video.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
const router = Router();

router.route("/upload-Videos")
    .post(verifyJWT, upload.fields([{ name: 'videoFile' }, { name: 'thumbnail' }]), publishAVideo);
router.route("/getAll-Videos").get(verifyJWT,getAllVideos);
router.route("/getVideoId/:videoId").get(verifyJWT,getVideoById);
router.route("/update-video/:videoId").patch(verifyJWT, upload.single('thumbnail'), updateVideo);
router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);



export default router;