const jwt = require("jsonwebtoken");
const { findToken } = require("../services/userAuth.services");

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    // Check if token is exist
    if (!token) return res.status(401).json({
        "Status": 401,
        "Success": false,
        "Message": "Unauthorized"
    });

    // Check if token is exist in DB
    const dbToken = await findToken(token);
    if (!dbToken) return res.status(404).json({
        "Status": 404,
        "Success": false,
        "Message": "Unauthorized"
    });
  
    // Check if token is valid (and not expired)
    jwt.verify(token, process.env.JWTKEY, (err, user) => { 
        if (err) return res.status(403).json({
            "Status": 403,
            "Success": false,
            "Message": "Unauthorized"
        })
    
        req.user = user;
        
        next();
    });
}

module.exports = {
    verifyToken,
}