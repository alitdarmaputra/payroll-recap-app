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
		
		if (hrd.status == "DELETED") return next(new ValidationError("Account has been deleted"));
		
		// Limit login attempt
		if(hrd.failed_login == 3) return next(new UnauthorizedError("You have reach maximum login attempt, try again in next 1 minutes"));

        if (await bcrypt.compare(req.body.password, hrd.password)) {
			if(hrd.is_login) {
				// Force log out in other device
				authServices.deleteToken({ user_id: hrd.id });
			}

            const token = jwt.sign({"id": hrd.id, "full_name": hrd.full_name}, process.env.JWTKEY, { expiresIn: '1h' });
            authServices.addToken(token, hrd.id);
			
			// Reset failed_login if success and update login status
			if(hrd.failed_login > 0)
				await HrdServices.editHrd({ id: hrd.id, failed_login: 0, is_login: true });
			else	
				await HrdServices.editHrd({ id: hrd.id, is_login: true });

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
		await HrdServices.editHrd({ id: hrd.id, failed_login: curr_failed_login}, curr_failed_login);
		
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
        
		let decoded = jwt.decode(token)
		await HrdServices.editHrd({ id: decoded.id, is_login: false });

        await authServices.deleteToken({ token });
			
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
  
