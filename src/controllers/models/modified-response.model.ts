import { Response } from 'express';

// interfaces
// tslint:disable-next-line:interface-name
export interface ModifiedResponse extends Response {
  advancedResults?: any;
}
