import Express from 'express'
import authRoutes from "./routers/auth.js";
import accountRoutes from "./routers/account.js";
import { statusCode } from './utils/constants.js';

import GlobalError from './utils/globalError.js';

const app = Express()

process.env.TZ = 'Asia/Kolkata';
app.use(Express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/account', accountRoutes);

app.all('*', (req, res, next) => {
    return next(
        new GlobalError(statusCode.NOT_FOUND, `${req.url} is not defined`)
    );
});

const errorRequestHandler = (err, req, res, next) => {
    const status = err.statusCode || 400;
    res.status(status).json({
        status: 'fail',
        error: err.error,
    });
};

app.use(errorRequestHandler);


export default app;