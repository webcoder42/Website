import  express  from "express";
import { isAdmin, requireSignIn } from './../middlewares/authMiddleware.js';
import { CategoryController, DeleteCategoryController, SingleCategoryController, createCategoryController, updateCategoryController } from "../controller/CategoryController.js";


const router = express.Router()

// Create CategoryRoutes
router.post('/create-category' , requireSignIn , isAdmin ,createCategoryController )

// Update CategoryRoutes
router.put('/update-category/:id' , requireSignIn , isAdmin, updateCategoryController)

//Get all Category
router.get('/get-category' , CategoryController)

//single category
router.get('/single-category/:slug' , SingleCategoryController)

//Delete Category
router.delete('/delete-category/:id' ,requireSignIn,isAdmin,  DeleteCategoryController)

export default router