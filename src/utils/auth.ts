import * as jwt from "jsonwebtoken";
import { Context } from '../context';

export interface AuthTokenPayload {
    userId: number;
}

export function decodeAuthHeader(authHeader: string): AuthTokenPayload {
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
        throw new Error("No token found.");
    }
    return jwt.verify(token, process.env.APP_SECRET as string) as AuthTokenPayload;
}

export function getUserId(context: Context) {
    const { userId } = context;
    if (!userId) {
        throw new Error ('Unauthorized.');
    }
    return userId;
}