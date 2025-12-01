import { Request } from 'express';
import * as core from 'express-serve-static-core';

// UserType: req.user 的類型
// P: Params 類型 (URL 參數)
// ResBody: Response Body 類型 (通常不用設，因為 Response 對象分開處理)
// ReqBody: Request Body 類型
// ReqQuery: Query String 類型
export interface AuthRequest<
    UserType = any,
    P = core.ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    user?: UserType;
}
