import express, { Router } from 'express'
// import isAuthenticated from '../middlewares/middleware.js';
import { addHoliday, addMembership, adminLogin, adminRegister, createCertificate, createDriver, createRide, createVehicle, createVehicleDetails, deleteCertificate, deleteDriver, deleteHoliday, deleteMembership, deleteSchool, deleteVehicle, deleteVehicleDetails, editDriver, editMembership, editPerMilePrice, editPrice, editSchool, editSingleRidePrice, editVehicleDetails, getAllCertificates, getAllDrivers, getAllMemberships, getAllParents, getAllPrices, getAllSchools, getAllVehicleDetails, getAllVehicleTypes, getHolidays, getParentChildren, logout, registerSchool } from '../controllers/admin.controller.js';
import isAdmin from '../middlewares/adminAuth.js';

const adminRouter=express.Router();

adminRouter.route('/register').post(adminRegister); //temporarily disabled
adminRouter.route('/login').post(adminLogin);
adminRouter.route('/logout').get(logout);

adminRouter.route('/create-school').post(isAdmin,registerSchool);
adminRouter.route('/delete-school').post(isAdmin,deleteSchool);
adminRouter.route('/edit-school').post(isAdmin,editSchool);
adminRouter.route('/get-all-school').get(isAdmin,getAllSchools);

adminRouter.route('/add-holiday').post(isAdmin,addHoliday);
adminRouter.route('/get-holidays').get(isAdmin,getHolidays);
adminRouter.route('/delete-holiday').post(isAdmin,deleteHoliday);

adminRouter.route('/add-membership').post(isAdmin,addMembership);
adminRouter.route('/get-all-membership').get(isAdmin,getAllMemberships);
adminRouter.route('/edit-membership').post(isAdmin,editMembership);
adminRouter.route('/delete-membership').post(isAdmin,deleteMembership);

adminRouter.route('/create-vehicle-type').post(isAdmin,createVehicle);
adminRouter.route('/delete-vehicle-type').post(isAdmin,deleteVehicle);
adminRouter.route('/get-vehicle-type').get(isAdmin,getAllVehicleTypes);


adminRouter.route('/create-certificate').post(isAdmin,createCertificate);
adminRouter.route('/delete-certificate').post(isAdmin,deleteCertificate);
adminRouter.route('/get-all-certificate').get(isAdmin,getAllCertificates);

adminRouter.route('/add-driver').post(isAdmin,createDriver);
adminRouter.route('/get-all-driver').get(isAdmin,getAllDrivers);
adminRouter.route('/edit-driver').post(isAdmin,editDriver);
adminRouter.route('/delete-driver').post(isAdmin,deleteDriver);

adminRouter.route('/add-vehicle-details').post(isAdmin,createVehicleDetails);
adminRouter.route('/get-all-vehicle-details').get(isAdmin,getAllVehicleDetails);
adminRouter.route('/edit-vehicle-details').post(isAdmin,editVehicleDetails);
adminRouter.route('/delete-vehicle-details').post(isAdmin,deleteVehicleDetails);

adminRouter.route('/get-all-parents').get(isAdmin,getAllParents);
adminRouter.route('/get-all-parents-children').get(isAdmin,getParentChildren);

adminRouter.route('/get-all-ride-prices').get(isAdmin,getAllPrices);
adminRouter.route('/edit-ride-price').post(isAdmin,editPrice);
adminRouter.route('/edit-single-ride-price').post(isAdmin,editSingleRidePrice);
adminRouter.route('/edit-per-mile-price').post(isAdmin,editPerMilePrice);

adminRouter.route('/create-ride').post(isAdmin,createRide);

export default adminRouter;