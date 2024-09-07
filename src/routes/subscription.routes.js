import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleSubscription,getUserChannelSubscribers,getSubscribedChannels} from "../controllers/subsciption.contoller.js"

const router = Router()

router.route("/subscribe/:channelId").post(verifyJWT,toggleSubscription)
router.route("/subscribers/:channelId").get(getUserChannelSubscribers)
router.route("/subscriptions/:subscriberId").get(getSubscribedChannels)

export default router