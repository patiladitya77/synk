import { IUserDocument } from "../utils/types";

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}
