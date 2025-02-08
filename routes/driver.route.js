import express, { Router } from 'express'
import { editDriver, forgotPassword, getDriverProfile, getSingleRide, getTodaysTrip, loginDriver, registerDriver } from '../controllers/driver.controller.js';
import isAuthenticatedDriver from '../middlewares/driverAuth.js';

const driverRouter=express.Router();

driverRouter.route('/register').post(registerDriver);
driverRouter.route('/login').post(loginDriver);
driverRouter.route('/reset-password').post(forgotPassword);
driverRouter.route('/edit-profile').post(isAuthenticatedDriver,editDriver);
driverRouter.route('/get-profile').get(isAuthenticatedDriver,getDriverProfile);
driverRouter.route('/get-days-rides').get(isAuthenticatedDriver,getTodaysTrip);
driverRouter.route('/get-single-ride/:id').get(isAuthenticatedDriver,getSingleRide);

export default driverRouter;