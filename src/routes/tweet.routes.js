import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { createTweet,getUserTweets, updateTweet,deleteTweet} from "../controllers/tweet.controller.js";
const router = Router();

router.route("/create-tweets").post(verifyJWT, createTweet);
router.route("/get-user-tweets").get(verifyJWT, getUserTweets);
router.route("/update-tweets/:id").put(verifyJWT, updateTweet);
router.route("/delete-tweets/:id").delete(verifyJWT, deleteTweet);



export default router;