import express from "express";
import { editProfile, followOrUnfollow, getActivity, getProfile, getSearch, getSuggestedUsers, login, logout, register } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/profile/edit').post(isAuthenticated, upload.single('profilePhoto'), editProfile);
router.route('/suggested').get(isAuthenticated, getSuggestedUsers);
router.route('/search').get(isAuthenticated, getSearch);
router.route('/search/:query?').get(isAuthenticated, getSearch);
router.route('/followorunfollow/:id').post(isAuthenticated, followOrUnfollow);
router.route('/activity').get(isAuthenticated, getActivity);
router.route('/:id/profile').get(isAuthenticated, getProfile);

export default router;