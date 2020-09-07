const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utility/errorResponse');
const asyncHandler = require('./asyncHandler');
const User = require('../model/user');

//Protect Routes

exports.protect = asyncHandler(async function (req, res, next) {

    let token;
    //Set token from bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    //Set token from cookie
    if (req.cookies.token) {
        token = req.cookies.token
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decoded);
        req.user = await User.findById(decoded.id);
        console.log(req.user);
        next();

    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));

    }
});

//Grant access to specific roles

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403));
        }
        next();
    }
}
