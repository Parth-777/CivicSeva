import mongoose from "mongoose";

let cachedConnection: typeof mongoose | null = null;
let cachedPromise: Promise<typeof mongoose> | null = null;

export async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined");
    }

    // Already connected
    if (cachedConnection) {
        return cachedConnection;
    }

    // Connection is currently being established
    if (!cachedPromise) {
        cachedPromise = mongoose.connect(MONGODB_URI);
    }

    cachedConnection = await cachedPromise;

    return cachedConnection;
}