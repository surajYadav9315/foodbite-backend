import db from "../database/db.js";
import { asyncHandler } from "../utils/methods.js";
import Validate from "../utils/validator.js";
import { statusCode } from "../utils/constants.js";
import { ObjectId } from "mongodb";
import GlobalError from "../utils/globalError.js";

export const getAccount = asyncHandler(async (req, res, next) => {
    const { _id: userId } = req.user;

    const user = await db().collection("users").findOne(
        { _id: new ObjectId(userId) }
    );

    res.status(statusCode.OK).json({
        status: 'success',
        data: user,
    });
});

export const updateEmail = asyncHandler(async (req, res, next) => {
    const { email } = (new Validate(req.body))
        .field("email")
        .required("please enter the email")
        .execute()


    const user = await db().collection("users").findOne({
        email
    }, { projection: { email: 1 } })

    if (user) {
        return next(new GlobalError(statusCode.BAD_REQUEST, "email already in use, please use another"))
    }

    const { _id: userId } = req.user;

    const result = await db().collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { email } }
    );

    res.status(statusCode.OK).json({
        status: 'success',
        message: "your email has been updated"
    });
});

export const updateLocation = asyncHandler(async (req, res, next) => {
    const { latitude, longitude } = (new Validate(req.body))
        .field("latitude")
        .required("please provide the latitude")
        .field("longitude")
        .required("please provide the longitude")
        .execute()


    const { _id: userId } = req.user;

    await db().collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                location: {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                }
            }
        }
    );

    res.status(statusCode.OK).json({
        status: 'success',
        message: "your location has been updated"
    });
})

export const updateName = asyncHandler(async (req, res, next) => {
    const { firstName, lastName } = (new Validate(req.body))
        .field("firstName")
        .required("please enter the firstname")
        .field("lastName")
        .required("please enter the lastname")
        .execute()

    const { _id: userId } = req.user;

    const result = await db().collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { firstName, lastName } }
    );

    console.log(result);

    res.status(statusCode.OK).json({
        status: 'success',
        message: "your name has been updated"
    });
})