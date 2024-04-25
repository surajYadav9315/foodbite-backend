import { Router } from 'express';
import {
    sendCode,
    verifyCode,
    verifyMobile,
    authorize,
    login,
} from '../controllers/auth.js';

const router = Router();

router.post("/send-code", sendCode);
router.post('/verify-mobile', verifyCode, login);


export default router;