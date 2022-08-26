require("dotenv").config();
const authServices = require("../services/userAuth.services");
const HrdServices = require("../services/userHrd.services");
const UnauthorizedError = require('../errors/UnauthorizedError');
const ValidationError = require('../errors/ValidationError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NotFoundError = require("../errors/NotFoundError");

const login = async (req, res, next) => {
    try {
        const hrd = await authServices.findHrd(req.body.email);

        if (!hrd) throw err;

        if (await bcrypt.compare(req.body.password, hrd.password)) {
            const token = jwt.sign({"id": hrd.id}, process.env.JWTKEY, { expiresIn: '1h' });
            authServices.addToken(token, hrd.id);

            return res.status(200).json({
                success: true,
                status: 200,
                message: "Login Success",
                data: hrd,
                token: token
            });
        }
        
        throw err;
    } catch (err) {
        return next(new UnauthorizedError("Unauthorized"));
    }
}

const logout = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const DBToken = await authServices.findToken(token);        

        if (!token || !DBToken) return next(new NotFoundError("Token not Found"));
            
        await authServices.deleteToken(token);

        return res.status(200).json({
            "Status": 200,
            "Success": true,
            "Message": "Logout Success"
        });
    } catch (err) {
        return next(new UnauthorizedError("Unauthorized"));
    }
}

const signup = async (req, res, next) => {
    try {
        const hrd = await HrdServices.addHrd(req.body);

        const token = jwt.sign({"id": hrd.id}, process.env.JWTKEY);
        authServices.addToken(token, hrd.id);

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Login Success",
            data: hrd,
            token: token
        });
    } catch (err) {
        return next(new ValidationError(err));
    }
}

module.exports = {
    login,
    signup,
    logout,
};
  