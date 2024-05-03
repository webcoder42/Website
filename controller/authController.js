
import { comparedPassword, hashPassword } from "../helper/authHelper.js";
import userModel from "../models/userModels.js";
import jwt from "jsonwebtoken";
import orderModel from '../models/orderModel.js'

//Register Controller
export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address ,answer} = req.body;
        if (!name || !email || !password || !phone || !address || !answer) {
            return res.status(400).send({ message: 'All fields are required' });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(200).send({
                success: false,
                message: 'User Already Registered, please login',
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = new userModel({ name, email, phone, address, password: hashedPassword  , answer});
        await user.save();

        res.status(201).send({
            success: true,
            message: 'User Successfully Registered',
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in registration',
            error
        });
    }
};

//Login Controller

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Email is not registered'
            });
        }

        const match = await comparedPassword(password, user.password);
        if (!match) {
            return res.status(400).send({
                success: false,
                message: 'Invalid password'
            });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRITE, { expiresIn: '7d' });


        res.status(200).send({
            success: true,
            message: 'Login Successfully',
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role : user.role,
            },
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in login',
            error
        });
    }
}; 
//Forget Password Controller
export const forgetPasswordController = async (req, res) => { // Corrected the order of parameters (req, res)
    try {
        const { email, answer, newPassword } = req.body;
        if (!email) {
            return res.status(400).send({ message: "Email is required" });
        }
        if (!answer) {
            return res.status(400).send({ message: "Answer is required" });
        }
        if (!newPassword) {
            return res.status(400).send({ message: "Enter your new password" });
        }
        // Check if the user exists and answer matches
        const user = await userModel.findOne({ email, answer });
        // If user not found or answer is incorrect
        if (!user) {
            return res.status(404).send({ success: false, message: 'Wrong email or answer' });
        }
        // Update user's password
        const hashedPassword = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });
        return res.status(200).send({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Something went wrong", error });
    }
}


//test controller
export const testController = (req, res) =>{
    res.send("protected routes");
};

//profile update

export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body;
        const user = await userModel.findById(req.user._id);
        //password
        if (password && password.length < 6) {
            return res.json({ error: "Password is required and must be at least 6 characters long" });
        }
        const hashedPassword = password ? await hashPassword(password) : undefined;
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user._id,
            {
                name: name || user.name,
                password: hashedPassword || user.password,
                phone: phone || user.phone,
                address: address || user.address,
            },
            { new: true } // This closing curly brace was missing
        );
        res.status(200).send({
            success: true,
            message: "Profile Updated Successfully",
            updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error While Updating Profile",
            error,
        });
    }
}



//Update password
export const updatePasswordController = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        // Fetch the user from the database
        const user = await userModel.findById(req.user._id);
        
        // Check if current password matches
        const match = await comparedPassword(currentPassword, user.password);
        if (!match) {
            return res.status(400).send({ success: false, message: 'Current password is incorrect' });
        }

        // Validate new password length
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).send({ success: false, message: 'New password is required and must be at least 6 characters long' });
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // Update the user's password in the database
        await userModel.findByIdAndUpdate(req.user._id, { password: hashedPassword });

        return res.status(200).send({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: 'Error while updating password', error });
    }
}

// getOrderController
export const getOrderController = async (req, res) => {
    try {
        const orders = await orderModel.find({ buyer: req.user._id }).populate('products', '-photo').populate("buyer", "name");
        res.json(orders); // Send the fetched orders instead of 'order'
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in getting order"
        });
    }
}

//All Order by admin
export const getAllOrderController = async (req, res) => {
    try {
        const orders = await orderModel.find({}).populate('products', '-photo').populate("buyer", "name").sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in getting order"
        });
    }
}


//update product status
export const orderStatusController =async(req , res) =>{
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const orders = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
          );
          res.json(orders);
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            error,
            message: "Error in status updating"
        })
    }
}
