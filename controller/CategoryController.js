import slugify from "slugify";
import CategoryModel from "../models/CategoryModel.js";

//create category
export const createCategoryController = async (req, res) =>{
    try {
        const {name} = req.body;
        if (!name) {
            return res.status(401).send({message:'Name is required'});
        }
        const existingCategory = await CategoryModel.findOne({name});
        if (existingCategory) {
            return res.status(200).send({
                success: true,
                message: 'Category is Already Existing'
            });
        }
        const category = await new CategoryModel({name, slug: slugify(name)}).save();
        res.status(201).send({
            success: true,
            message:'New Category Created',
            category
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Category'
        });
    }
};


//update Category

export const updateCategoryController = async (req , res) =>{
    try {
        const {name} = req.body
        const {id} = req.params
        const category = await  CategoryModel.findByIdAndUpdate(id , {name, slug: slugify(name)} , {new:true})
        res.status(200).send({
            success : true,
            message: 'Category Update successfully',
            category,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in update Category'
        });
    }
};


//get category
export const CategoryController = async (req , res) => {
    try {
        const category = await  CategoryModel.find({})
        res.status(200).send({
            success: true,
            message: 'All category list',
            category,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Get all Category'
        });

    }

}

//get single category

export const  SingleCategoryController = async(req , res) => {
    try {
        const {slug} = req.params
        const category = await  CategoryModel.findOne({slug:req.params.slug})
        res.status(200).send({
            success: true,
            message: 'Get single category ',
            category,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Get single Category'
        });
    }
};


//delete category

export const DeleteCategoryController = async(req , res) =>{
    try {
        const {id} = req.params
        await CategoryModel.findByIdAndDelete(id)
        res.status(200).send({
            success: true,
            message: ' category deleted successfully',
           
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Delete Category'
        });
    }
};