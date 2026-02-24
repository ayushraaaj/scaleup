import { JwtPayload } from "jsonwebtoken";
import { IUser } from "./IUser";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
            mentor?: JwtPayload;
        }
    }
}
