import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getVideoComments, addComment, updateComment, deleteComment } from "../controllers/comment.contoller.js";

const router = Router();
router.route("/add-comment/:videoId").post(verifyJWT, addComment);
router.route("/update-comment/:commentId").put(verifyJWT, updateComment);
router.route("/get-comment/:videoId").get(verifyJWT, getVideoComments);
router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment);



export default router;