import app from './app.js';
import { connectDB } from './database/db.js';
import { configDotenv } from 'dotenv';

configDotenv()

const PORT = process.env.PORT || 3000;
const environment = process.env.NODE_ENV;



try {
    await connectDB();
    app.listen(PORT, () => {
        console.log(
            `🚀 server is running at ${PORT} in ${environment} environment`
        );
    });
} catch (err) {
    console.log(err);
}