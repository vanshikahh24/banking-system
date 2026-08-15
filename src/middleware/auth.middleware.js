const userModel = require("../models/user.models");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
    const token =
        req.cookies.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized user, no token"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await userModel.findById(decoded.userId);

        req.user = user;

        return next();

    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized login"
        });
    }
}
async function SystemUserMiddleware(req, res, next) {
    const token =
        req.cookies?.token ||
        req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized user, no token"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await userModel
            .findById(decoded.userId)
            .select("+SystemUser");

        if (!user || !user.SystemUser) {
            return res.status(403).json({
                message: "Forbidden, user is not a system user"
            });
        }

        req.user = user;

        return next();

    } catch (err) {
        console.error("System user auth error:", err);

        return res.status(401).json({
            message: "Unauthorized login"
        });
    }
}
module.exports = {
    authMiddleware,
    SystemUserMiddleware
};