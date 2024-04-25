import { Router } from 'express';
import {
    sendCode,
    verifyCode,
    verifyMobile,
    authorize,
    updateMobileNumber,
} from '../controllers/auth.js';

import {
    getAccount,
    updateName,
    updateEmail,
    updateLocation
} from "../controllers/account.js";

const router = Router();

router.get("/", authorize, getAccount);
router.put("/name", authorize, updateName);
router.put("/email", authorize, updateEmail);
router.put("/location", authorize, updateLocation);

router.patch("/mobile/send-code", authorize, verifyMobile, sendCode);
router.patch('/mobile/verify', authorize, verifyCode, updateMobileNumber);


export default router;