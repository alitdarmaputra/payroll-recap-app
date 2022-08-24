require("dotenv").config();
const authServices = require("../services/userAuth.services");
const HrdServices = require("../services/userHrd.services");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
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
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Unauthenticated",
            data: null,
        });
    }
}

const logout = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const DBToken = await authServices.findToken(token);        

        if (!token || !DBToken) return res.status(404).json({
            "Status": 404,
            "Success": false,
            "Message": "Token Not Found"
        });

        await authServices.deleteToken(token);

        return res.status(200).json({
            "Status": 200,
            "Success": true,
            "Message": "Logout Success"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal Server Error",
            data: null,
        });
    }
}

const signup = async (req, res) => {
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
        return res.status(500).json({
            success: false,
            status: 500,
            message: err.message,
            data: null,
        });
    }
}

module.exports = {
    login,
    signup,
    logout,
};
  