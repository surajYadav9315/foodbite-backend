import { MongoClient } from 'mongodb';

import { configDotenv } from 'dotenv';
configDotenv()

const CONNECTION_URI = process.env.DB_CONNECTION_URI
    .replace('<password>', process.env.DB_PASSWORD);


const mongoClient = new MongoClient(CONNECTION_URI);

let _database;

export const connectDB = async () => {
    try {
        const client = await mongoClient.connect();
        console.log('🚀 Connected to the database');
        _database = client.db('foodbite');
    } catch (err) {
        console.log(err.message);
    }
};

const db = () => {
    if (!_database) {
        throw new Error('Failed to connect to the database');
    }
    return _database;
};

export default db;