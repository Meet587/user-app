import { Types } from "mongoose";
import { DefaultSession } from "next-auth";
declare module 'next' {
    interface Request {
        user?: {
            _id: Types.ObjectId;
            email: string;
        }
    }
}

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            twoFactorEnabled: boolean;
            twoFactorVerified: boolean;
        } & DefaultSession["user"]
    }
}

// declare module "JWT" {
//     interface JWT {
//         user: {
//             twoFactorEnabled: boolean;
//             twoFactorVerified: boolean;
//         }
//     }
// }

