import JWT from "jsonwebtoken"; // Removed { decode }
import userModels from "../models/userModels.js";

// Protected Routes
export const requireSignIn = async (req, res, next) => {
    try {
        const decodedToken = JWT.verify(req.headers.authorization, process.env.JWT_SECRITE); // Changed variable name to avoid conflict
        req.user = decodedToken; // Assign decoded token to req.user
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success: false,
            message: 'Unauthorized Access'
        });
    }
};

// Admin Access
export const isAdmin = async (req, res, next) => {
    try {
        const user = await userModels.findById(req.user._id); // Assuming req.user contains the user ID
        if (!user || user.role !== 1) {
            return res.status(401).send({
                success: false,
                message: 'Unauthorized Access'
            });
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            success: false,
            message: 'Error in admin middleware'
        });
    }
};
