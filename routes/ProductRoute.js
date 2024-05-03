import  express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { 
    DeleteProductController,
     PhotoProductController,
      ProductController,
       SingleProductController,
        braintreePaymentController,
        braintreeTokenController,
        createProductController,
        productCategoryController,
        productCountController,
         productFilterController,
          productListController,
          realtedProductController,
          searchProductController,
          updateProductController 
        } from "../controller/ProductController.js";
import Formidable from "express-formidable";



const router = express.Router()

// Create CategoryRoutes
router.post('/create-product' , requireSignIn , isAdmin, Formidable(),createProductController )

// Update ProductRoutes
router.put('/update-product/:pid' , requireSignIn , Formidable(), isAdmin, updateProductController)

//Get Product
router.get('/get-product' , ProductController)

//single category
router.get('/single-product/:slug' , SingleProductController)

//Delete Product
router.delete('/delete-product/:pid', DeleteProductController)

//Get Photo Product
router.get('/product-photo/:pid' , PhotoProductController)

//product filter
router.post('/product-filters' , productFilterController)

//count
router.get('/product-count' , productCountController)

//Per page product
router.get('/product-list/:page' , productListController)


//Search Product
router.get('/search/:keyword' , searchProductController)

//Product similar 
router.get("/related-product/:pid/:cid", realtedProductController);


//Category wise Product
router.get('/product-category/:slug' , productCategoryController)

//payment getway token route
//token
router.get('/braintree/token' , braintreeTokenController)

//Payment
router.post('/braintree/payment' , requireSignIn , braintreePaymentController)

export default router