import { User } from 'db';

export type UserRequest = {
  user: User;
};
export type UserResponse = Omit<User, 'password'>;
