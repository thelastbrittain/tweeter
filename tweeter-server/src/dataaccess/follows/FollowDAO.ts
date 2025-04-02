import { UserDto } from "tweeter-shared";

export interface FollowDAO {
  putFollow(followerAlias: string, followeeAlias: string): Promise<void>;
  deleteFollow(followerAlias: string, followeeAlias: string): Promise<void>;
  getFollow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<{ follower: string; followee: string } | null>;
  getPageOfFollowees(
    alias: string,
    pageSize: number,
    lastAlias: string | null
  ): Promise<[string[], boolean]>;
  getPageOfFollowers(
    alias: string,
    pageSize: number,
    lastAlias: string | null
  ): Promise<[string[], boolean]>;
}
