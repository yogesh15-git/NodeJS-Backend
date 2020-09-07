const crypto = require('crypto');
const User = require('../model/user');
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utility/errorResponse");
const sendEmail = require('../utility/sendEmail');


//Register user=api/vi/auth/register

exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, role, password } = req.body;

    const user = await User.create({
        name,
        email,
        role,
        password
    });

    //Create Token
    sendTokenResponse(user, 200, res)

})


//login user= POST /api/vi/auth/login
exports.login = asyncHandler(async function (req, res, next) {
    const { email, password } = req.body

    //validate email and password
    if (!email && !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    //Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid Credentials', 401));
    }

    //check if password match
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid Credentials', 401));

    }

    //Create Token
    sendTokenResponse(user, 200, res)
})

//Get token from model,create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {

    //Create Token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }


    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({ success: true, token });

}

//Get user by ID=api/v1/auth/getuser
exports.getUser = asyncHandler(async (req, res, next) => {
    try {
        var user = await User.findById(req.user.id);

    } catch (error) {
        return next(new ErrorResponse(`Please login first`, 404));
    }

    res.status(200)
        .json({
            success: true,
            data: user
        })
});

//Logout user by get req=api/v1/auth/logout
exports.logoutUser = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200)
        .json({
            success: true,
            data: {}
        })
});

//Forgot password=(POST)  api/vi/auth/forgotpassword
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse(`No account found by ${req.body.email}`, 404));
    }

    //Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    //Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `you are recieving this email because you (or someone else ) has requested to reset the password.
    Please make a put request to:\n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'password reset token',
            text: message
        });
        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500))

    }

})

//Reset password=(PUT) api/v1/auth/resetpassword/:resettoken
exports.resetPassword = asyncHandler(async (req, res, next) => {
    //Get Hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400))
    }

    //Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    //Create Token
    sendTokenResponse(user, 200, res);
});

//Update userby ID=api/v1/auth/updateuser
exports.updateUser = asyncHandler(async (req, res, next) => {
    const userDetails = {
        email: req.body.email,
        name: req.body.name
    }
    const user = await User.findByIdAndUpdate(req.user.id, userDetails, {
        new: true,
        runValidators: true
    });

    res.status(200)
        .json({
            success: true,
            data: user
        })
});

// Update user password=api/v1/auth/updatepassword
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    //check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});