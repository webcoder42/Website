import slugify from "slugify";
import ProductModel from "../models/ProductModel.js";
import fs from 'fs';
import CategoryModel from "../models/CategoryModel.js";
import braintree from "braintree";
import orderModel from "../models/orderModel.js";
import dotenv from 'dotenv';


dotenv.config();


//Payment Getway
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
  });
  



// Create Product
export const createProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity } = req.fields;
        const { photo } = req.files;

        // Validation
        switch (true) {
            case !name:
                return res.status(400).send({ error: 'Name is required' });
            case !description:
                return res.status(400).send({ error: 'Description is required' });
            case !price:
                return res.status(400).send({ error: 'Price is required' });
            case !category:
                return res.status(400).send({ error: 'Category is required' });
            case !quantity:
                return res.status(400).send({ error: 'Quantity is required' });
            case photo && photo.size > 1000000:
                return res.status(400).send({ error: 'Photo is required and should be less than 1 MB' });
        }

        const product = new ProductModel({ ...req.fields, slug: slugify(name) });

        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }

        await product.save();

        res.status(201).send({
            success: true,
            message: 'Product created successfully',
            product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error in product',
        });
    }
};

// Get Products
export const ProductController = async (req, res) => {
    try {
        const products = await ProductModel.find({}).populate('category').select('-photo').limit(12).sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            totalProduct: products.length,
            message: 'All Product list',
            products,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error in Get Products',
        });
    }
};

// Single Product Get
export const SingleProductController = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await ProductModel.findOne({ slug }).populate('category').select('-photo');
        
        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).send({
            success: true,
            message: 'Get single Product',
            product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error in Get single Product',
        });
    }
};
// Get Photo
export const PhotoProductController = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.pid).select("photo");
        if (product && product.photo && product.photo.data) {
            res.set('Content-type', product.photo.contentType);
            return res.status(200).send(product.photo.data);
        } else {
            return res.status(404).send({
                success: false,
                message: 'Photo not found',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error in getting photo product',
        });
    }
};

//delete product
export const DeleteProductController = async (req, res) => {
    try {
        await ProductModel.findByIdAndDelete(req.params.pid).select("-photo");

        res.status(200).send({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error in deleting the product',
        });
    }
};
//update
export const updateProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity } = req.fields;
        const { photo } = req.files;

        // Validation
        switch (true) {
            case !name:
                return res.status(400).send({ error: 'Name is required' });
            case !description:
                return res.status(400).send({ error: 'Description is required' });
            case !price:
                return res.status(400).send({ error: 'Price is required' });
            case !category:
                return res.status(400).send({ error: 'Category is required' });
            case !quantity:
                return res.status(400).send({ error: 'Quantity is required' });
            case photo && photo.size > 1000000:
                return res.status(400).send({ error: 'Photo is required and should be less than 1 MB' });
        }

        const product = await ProductModel.findByIdAndUpdate(req.params.pid, { ...req.fields, slug: slugify(name) }, { new: true });

        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }

        await product.save();

        res.status(200).send({
            success: true,
            message: 'Product updated successfully',
            product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: 'Error in updating product',
        });
    }
};




//filter
export const productFilterController = async (req, res) => {
    try {
        const { checked, radio } = req.body;
        let args = {};
        if (checked.length > 0) args.category = checked;
        if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
        const products = await ProductModel.find(args)
        res.status(200).send({
            success: true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error While Filtering Products",
            error,
        });
    }
};

//load more roduct
export const productCountController = async (req, res) => {
    try {
      const total = await ProductModel.find({}).estimatedDocumentCount();
      res.status(200).send({
        success: true,
        total,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        message: "Error in product count",
        error,
        success: false,
      });
    }
  };

  // product list base on page
export const productListController = async (req, res) => {
    try {
      const perPage = 3;
      const page = req.params.page ? req.params.page : 1;
      const products = await ProductModel
        .find({})
        .select("-photo")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: -1 });
      res.status(200).send({
        success: true,
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "error in per page ctrl",
        error,
      });
    }
  };


  //search product
  export const searchProductController =async (req , res)=>{

    try {
        const {keyword} = req.params
        const result = await ProductModel.find({

            $or : [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        }).select("-photo");
        res.json(result);
    } catch (error) {
        console.log(error)
        res.status(404).send({
            success: false,
            message: 'Error in search product',
            error
        })
    }
  }


  // similar products
export const realtedProductController = async (req, res) => {
    try {
      const { pid, cid } = req.params;
      const products = await ProductModel
        .find({
          category: cid,
          _id: { $ne: pid },
        })
        .select("-photo")
        .limit(3)
        .populate("category");
      res.status(200).send({
        success: true,
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "error while geting related product",
        error,
      });
    }
  };
  

  //Category wise Product
  export const productCategoryController = async(req , res) =>{
    try {
        const category = await CategoryModel.findOne({slug: req.params.slug})
        const products = await ProductModel.find({category}).populate('category')
        res.status(200).send({
            success: true,
            category,
            products,
        
        })
    } catch (error) {
        console.log(error)
        res.status(400).status({
            success: false,
            error,
            message: 'Error while getting product by category'
        })
    }
  }

  //Payment token
  export const braintreeTokenController =async (req , res) =>{
    try {
        gateway.clientToken.generate({} , function(err ,response){
            if (err) {
                res.status(500).send(err);
              } else {
                res.send(response);
              }
        })
    } catch (error) {
        console.log(error)
    }
  }

  //payment
  export const braintreePaymentController = async (req, res) => {
    try {
        const { nonce, cart } = req.body;
        let total = 0;
        cart.forEach((item) => {
            total += item.price;
        });

        gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true,
            }
        }, async (error, result) => {
            if (error) {
                console.error(error);
                res.status(500).send(error);
                return;
            }
            
            try {
                const order = new orderModel({
                    products: cart,
                    payment: result,
                    buyer: req.user._id,
                });
                await order.save();
                res.json({ ok: true });
            } catch (saveError) {
                console.error(saveError);
                res.status(500).send(saveError);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};
