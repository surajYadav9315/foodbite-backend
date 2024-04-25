import db from '../database/db.js';
import GlobalError from '../utils/globalError.js';
import { asyncHandler } from '../utils/methods.js';
import { responseStatus, statusCode, responseMessage, environment } from '../utils/constants.js';
import { createHmac } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { userTypes } from '../utils/constants.js';
import Validator from '../utils/validator.js';
import crypto from 'node:crypto';
import axios from 'axios';



const hashData = (data) => {
    return createHmac('sha256', process.env.HASH_SECRET)
        .update(JSON.stringify(data))
        .digest('hex');
};


export const sendCode = asyncHandler(async (req, res, next) => {
    const { mobileNumber } = new Validator(req.body)
        .field('mobileNumber')
        .required('Please enter your mobile number.')
        .check(/^[0-9]{10}$/, 'Please enter a valid mobile number.')
        .execute();


    const code = crypto.randomInt(1234, 9876);

    if (process.env.NODE_ENV === environment.PRODUCTION && process.env.SEND_SMS === 'true') {
        const smsBaseUrl = process.env.SMS_BASE_URL;
        const smsAuthorization = process.env.SMS_AUTHORIZATION;

        const params = {
            route: 'otp',
            authorization: smsAuthorization,
            variables_values: code,
            flash: 0,
            numbers: mobileNumber
        };

        axios.get(smsBaseUrl, { params, timeout: 2000 })
            .then(response => {

            })
            .catch(error => {
                console.error(error);
            });

    } else {
        console.log(`${mobileNumber}, verification code = ${code}`);
    }


    const expiresAt = new Date();

    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const hash = hashData({
        mobileNumber, code, expiresAt
    })

    return res.status(200).json({
        status: "success",
        data: {
            mobileNumber,
            expiresAt,
            hash
        }
    })
});



export const verifyCode = asyncHandler(async (req, res, next) => {
    const { mobileNumber, code, expiresAt, hash } = new Validator(
        req.body
    )
        .field('mobileNumber')
        .required('mobile number is required.')
        .field('code')
        .required('Please enter your verification code.')
        .isNumber('verification code must be a number')
        .field('expiresAt')
        .required('expires at is required.')
        .isDate('expires at must be a date')
        .field('hash')
        .required('hash is required.')
        .execute();


    if (new Date() > new Date(expiresAt)) {
        return next(
            new GlobalError(statusCode.BAD_REQUEST, responseMessage.CODE_EXPIRES)
        );
    }

    const userHash = hashData({ mobileNumber, code, expiresAt });

    if (userHash !== hash) {
        return next(
            new GlobalError(statusCode.BAD_REQUEST, responseMessage.INCORRECT_CODE)
        );
    }
    next();
});

export const verifyMobile = asyncHandler(async (req, res, next) => {
    const { mobileNumber } = new Validator(req.body)
        .field('mobileNumber')
        .required('Please enter your mobile number.')
        .check(/^[0-9]{10}$/, 'Please enter a valid mobile number.')
        .execute();

    if (req.user.mobileNumber === mobileNumber) {
        return next(
            new GlobalError(statusCode.BAD_REQUEST, "Mobile number already exist, please use another")
        );
    }

    const result = await db()
        .collection('users')
        .findOne({
            mobileNumber
        });


    if (result) {
        return next(
            new GlobalError(statusCode.BAD_REQUEST, "Mobile number already exist, please use another")
        );
    }

    next()


    // const authToken = jwt.sign(
    //     {
    //         userId: result._id,
    //     },
    //     process.env.JWT_SECRET_KEY,
    //     {
    //         expiresIn: '90d',
    //     }
    // );

    // res.status(statusCode.OK).json({
    //     status: responseStatus.SUCCESS,
    //     data: {
    //         authToken,
    //     },
    // });
});

export const login = asyncHandler(async (req, res, next) => {
    const { mobileNumber } = req.body;

    const user = await db().collection("users").findOne({
        mobileNumber
    })

    let userId;

    if (user) {
        userId = user._id;
    } else {
        const newUser = await db().collection('users').insertOne({
            mobileNumber,
            active: true,
            createdAt: new Date(),
            userType: userTypes.CUSTOMER
        });
        userId = newUser.insertedId;
    }


    const authToken = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
        expiresIn: '90d',
    });


    return res.status(statusCode.OK).json({
        status: responseStatus.SUCCESS,
        data: {
            authToken,
        },
    });
});


export const updateMobileNumber = asyncHandler(async (req, res, next) => {
    const { mobileNumber } = req.body;
    const userId = req.user._id;

    const user = await db()
        .collection('users')
        .updateOne(
            { _id: new ObjectId(userId) },
            { $set: { mobileNumber, updatedAt: new Date() } }
        );

    if (user.matchedCount < 1) {
        return next(
            new GlobalError(statusCode.NOT_FOUND, responseMessage.ACCOUNT_NOT_FOUND)
        );
    }


    res.status(statusCode.OK).json({
        status: 'success',
        message: 'Your mobile number has been successfully updated.',
    });
});



export const authorize = asyncHandler(async (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer')) {
        return next(
            new GlobalError(statusCode.UNAUTHORIZED, responseMessage.UNAUTHORIZED)
        );
    }

    const authToken = authorization.split(' ').at(1);


    if (!authToken) {
        return next(
            new GlobalError(statusCode.UNAUTHORIZED, responseMessage.INVALID_TOKEN)
        );
    }

    const data = jwt.verify(authToken, process.env.JWT_SECRET_KEY);



    const { userId } = data;


    const user = await db()
        .collection('users')
        .findOne({
            _id: new ObjectId(userId),
        });

    if (!user) {
        return next(
            new GlobalError(statusCode.NOT_FOUND, responseMessage.ACCOUNT_NOT_FOUND)
        );
    }


    req.user = user;
    next();
});

export const accessPermission = (...users) => {
    return asyncHandler(async (req, res, next) => {
        if (!users.includes(req.user.userType)) {
            return next(
                new GlobalError(statusCode.UNAUTHORIZED, responseMessage.CAN_NOT_ACCESS)
            );
        }
        next();
    });
};