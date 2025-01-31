import express, { Router } from 'express'
import { addChild, deleteChild, editChild, forgotPassword, getAllChild, getProfile, getSingleChild, login, logout, register } from '../controllers/users.controller.js';
import isAuthenticated from '../middlewares/middleware.js';

const userRouter=express.Router();

userRouter.route('/register').post(register);
userRouter.route('/login').post(login);
userRouter.route('/reset-password').post(forgotPassword);
userRouter.route('/logout').get(logout);
userRouter.route('/add-child').post(isAuthenticated,addChild);
userRouter.route('/get-all-children').get(isAuthenticated,getAllChild);
userRouter.route('/get-user-data').get(isAuthenticated,getProfile);
userRouter.route('/get-child').get(isAuthenticated,getSingleChild);
userRouter.route('/edit-child').post(isAuthenticated,editChild);
userRouter.route('/delete-child').post(isAuthenticated,deleteChild);

export default userRouter;