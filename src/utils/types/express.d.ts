import 'express';

declare module 'express' {
  export interface Request {
    fullurl: string;
    admin: { admin_id: string; role: 'admin' | 'superadmin' };
  }
}
