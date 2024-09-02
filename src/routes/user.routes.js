import {Router} from 'express';
import { loginUser, logoutUser, registerUser,refreshAccessToken, changePassword, getCurrentUser, updateAccoutDetails, updateUserAvatar, updateUserCover, getUserChannelProfile, getWatchHistory } from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJWT} from '../middlewares/auth.middleware.js'
const router = Router();
router.route("/register").post(
    upload.fields([
       { name: 'avatar',
        maxcount: 1
       },
       {
        name : "coverImage",
        maxcount: 1
       }
    ]),
    registerUser)


router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changePassword) //verifyjwt means sifr logged in log hi ise use krr paye.

router.route ("/current-user").get( verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccoutDetails) // jab kuch cheeze update krniho tab patch use hota hai

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCover)


router.route("/c/:username").get(verifyJWT,getUserChannelProfile) // prams se value ane pe ise route krte hain or name same hoga jo conroller m diya hoga

router.route("/history").get(verifyJWT,getWatchHistory) // prams se value ane pe ise route krte hain or name same hoga jo conroller m diya hoga


export default router;
