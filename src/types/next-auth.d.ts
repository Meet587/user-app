import { Types } from "mongoose";

declare module 'next' {
    interface Request {
        user?: {
            _id: Types.ObjectId;
            email: string;
        }
    }
}
