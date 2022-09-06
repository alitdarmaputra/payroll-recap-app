require("dotenv").config();
const authServices = require("../services/userAuth.services");
const HrdServices = require("../services/userHrd.services");
const UnauthorizedError = require('../errors/UnauthorizedError');
const ValidationError = require('../errors/ValidationError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NotFoundError = require("../errors/NotFoundError");
const { Worker } = require("worker_threads");

const login = async (req, res, next) => {
    try {
        const hrd = await authServices.findHrd(req.body.email);

        if (!hrd) return next(new NotFoundError("User not found, plase sign up"));
		
		// Limit login attempt
		if(hrd.failed_login == 3) return next(new UnauthorizedError("You have reach maximum login attempt, try again in next 5 minutes"));

        if (await bcrypt.compare(req.body.password, hrd.password)) {
            const token = jwt.sign({"id": hrd.id, "full_name": hrd.full_name}, process.env.JWTKEY, { expiresIn: '1h' });
            authServices.addToken(token, hrd.id);
			
			// Reset failed_login if success
			if(hrd.failed_login > 0)
				await authServices.updateFailedLogin(req.body.email, 0);

			return res.status(200).json({
				success: true,
                status: 200,
                message: "Login Success",
                data: hrd,
                token: token
            });
        }
		
		// Update failed login status
		const curr_failed_login = hrd.failed_login + 1;
		await authServices.updateFailedLogin(req.body.email, curr_failed_login);
		
		if(curr_failed_login == 3) {
			const reset_login_worker = new Worker("./services/resetFailedLogin.services");
			// Start thread to reset failed_login after 1 minutes			
			reset_login_worker.postMessage(hrd.email);
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

        const token = jwt.sign({"id": hrd.id, "full_name": hrd.full_name}, process.env.JWTKEY);
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
  
