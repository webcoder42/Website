import express from 'express';
import { registerController,loginController, testController, forgetPasswordController, updateProfileController, updatePasswordController, getOrderController, getAllOrderController, orderStatusController } from '../controller/authController.js'; // Updated import path
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
// Router object
const router = express.Router();

// Routing
// REGISTER POST METHOD
router.post('/register', registerController);

//Login POST
router.post('/login', loginController)

//Forget Password
router.post('/forget-password' , forgetPasswordController)

//test routes
router.get('/test',requireSignIn,isAdmin, testController)

//Protected user  Routes Auth
router.get('/user-auth' , requireSignIn, (req, res) => {
    res.status(200).send({ok: true})
});
//Protected Admin  Routes Auth
router.get('/admin-auth' , requireSignIn, isAdmin,(req, res) => {
    res.status(200).send({ok: true})
});


//update profile
router.put("/profile", requireSignIn, updateProfileController);

//update profile
router.put("/change-password", requireSignIn, updatePasswordController);


//order
router.get('/orders', requireSignIn, getOrderController);

//All Order by admin
router.get('/all-orders', requireSignIn,isAdmin, getAllOrderController);


//Order status Update
router.get('/order-status/:orderId', requireSignIn,isAdmin, orderStatusController);




export default router;
