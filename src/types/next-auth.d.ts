import { UserRole } from "@/enum/userRole";
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
    interface User {
        imageUrl?: string;
        twoFactorEnabled: boolean;
        twoFactorVerified: boolean;
    }
    interface Session extends DefaultSession {
        user: {
            id: string;
            role: UserRole;
            imageUrl: string;
            twoFactorEnabled: boolean;
            twoFactorVerified: boolean;
        } & DefaultSession["user"]
    }
}

// declare module "JWT" {
//     interface JWT {
//         user: {
//             imageUrl: string;
//             twoFactorEnabled: boolean;
//             twoFactorVerified: boolean;
//         }
//     }
// }

