const userModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.services");

async function UserRegister(req, res) {
    try {
        const { name, email, password } = req.body;

        const isExists = await userModel.findOne({
            email
        });

        if (isExists) {
            return res.status(422).json({
                message: "email already exists",
                status: "failed"
            });
        }

        const user = await userModel.create({
            name,
            password,
            email
        });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false
        });

        await emailService.sendRegistrationEmail(
            user.email,
            user.name
        );

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}


async function UserLogin(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel
            .findOne({ email })
            .select("+password");

        if (!user) {
            return res.status(401).json({
                message: "email or password is invalid"
            });
        }

        const isValidPassword = await user.comparePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({
                message: "email or password is invalid"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false
        });

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}


module.exports = {
    UserRegister,
    UserLogin
};