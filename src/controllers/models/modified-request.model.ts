import { Request } from 'express';
import { UserModel } from '../../models/User';

// interfaces
// tslint:disable-next-line:interface-name
export interface ModifiedRequest extends Request {
  user?: UserModel | null;
}
