import { UserDto } from "tweeter-shared";
export interface UserDAO {
  getUser(alias: string): Promise<UserDto | null>;
  putUser(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageFileExtension: string
  ): Promise<void>;
  getNumFollowers(alias: string): Promise<number>;
  getNumFollowees(alias: string): Promise<number>;
  incrementNumFollowers(alias: string): Promise<void>;
  incrementNumFollowees(alias: string): Promise<void>;
  decrementNumFollowers(alias: string): Promise<void>;
  decrementNumFollowees(alias: string): Promise<void>;
}
