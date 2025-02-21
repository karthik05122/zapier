// In a file like custom-types.d.ts in your project root or a specific types folder

declare namespace Express {
    export interface Request {
      id?: string;
    }
  }

