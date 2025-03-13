import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'pNodeStore';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }

    const client = await MongoClient.connect(MONGODB_URI);

    cachedClient = client;
    return client;
}

async function DBConnect() {
    const client = await connectToDatabase();
    const db = client.db(DB_NAME);

    return { client, db };
}

export default DBConnect;
