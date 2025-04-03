
import { User } from '@/types';

// Extend the User type with an optional password field
declare module '@/types' {
  interface User {
    password?: string;
  }
}
