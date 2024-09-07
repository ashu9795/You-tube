import Router from 'express';
import { createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist} from "../controllers/playlist.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"


const router = Router();

router.route("/create-playlist").post(verifyJWT, createPlaylist);
router.route("/user-playlists/:userId").get(getUserPlaylists);
router.route("/playlist/:playlistId").get(getPlaylistById);
router.route("/add-video/:playlistId/:videoId").post(addVideoToPlaylist);
router.route("/del-video/:playlistId/:videoId").delete(removeVideoFromPlaylist);
router.route("/delete-playlist/:playlistId").delete(deletePlaylist);
router.route("/update-playlist/:playlistId").put(updatePlaylist);

export default router;