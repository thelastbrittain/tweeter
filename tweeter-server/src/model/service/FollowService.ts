import { FakeData, User, UserDto } from "tweeter-shared";
import { Service } from "./Service";
import { UserDAO } from "../../dataaccess/user/UserDAO";
import { AuthDAO } from "../../dataaccess/auth/AuthDAO";
import { FollowDAO } from "../../dataaccess/follows/FollowDAO";
import { BadRequest } from "../../Error/BadRequest";

export class FollowService extends Service {
  private followDAO: FollowDAO;
  public constructor(
    userDAO: UserDAO,
    authDAO: AuthDAO,
    followsDAO: FollowDAO
  ) {
    super(userDAO, authDAO);
    this.followDAO = followsDAO;
  }

  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    return await this.loadMoreFollows(
      token,
      userAlias,
      pageSize,
      lastItem,
      (userAlias: string, pageSize: number, lastItem: string | null) => {
        return this.followDAO.getPageOfFollowers(userAlias, pageSize, lastItem);
      }
    );
  }

  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    return await this.loadMoreFollows(
      token,
      userAlias,
      pageSize,
      lastItem,
      (userAlias: string, pageSize: number, lastItem: string | null) => {
        return this.followDAO.getPageOfFollowees(userAlias, pageSize, lastItem);
      }
    );
  }

  public async loadMoreFollows(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null,
    getPageOfFollows: (
      userAlias: string,
      pageSize: number,
      lastItem: string | null
    ) => Promise<[string[], boolean]>
  ): Promise<[UserDto[], boolean]> {
    return await this.tryRequest(async () => {
      await this.verifyAuth(token);

      const result = await getPageOfFollows(
        userAlias,
        pageSize,
        lastItem ? lastItem.alias : null
      );
      if (!result) {
        throw new BadRequest("There are no more followees");
      }
      const [userAliases, hasMore] = result;
      const userDTOs: UserDto[] = await this.userDAO.batchGetUser(userAliases);
      return [userDTOs, hasMore];
    }, "Failed to load more followers");
  }

  public async getIsFollowerStatus(
    token: string,
    userAlias: string,
    selectedUserAlias: string
  ): Promise<boolean> {
    return await this.tryRequest(async () => {
      await this.verifyAuth(token);
      const result = await this.followDAO.getFollow(
        userAlias,
        selectedUserAlias
      );
      if (result) {
        return true;
      } else {
        console.error("Follower or Followee Doesn't exist");
        throw new BadRequest("Follower or Followee Doesn't exist");
      }
    }, "Failed to get is follower status");
  }

  public async getFolloweeCount(
    token: string,
    userAlias: string
  ): Promise<number> {
    await this.verifyAuth(token);
    const { followeeCount } = await this.getFollowCount(userAlias);
    return followeeCount;
  }

  public async getFollowerCount(
    token: string,
    userAlias: string
  ): Promise<number> {
    await this.verifyAuth(token);
    const { followerCount } = await this.getFollowCount(userAlias);
    return followerCount;
  }

  public async follow(
    token: string,
    userAliasToFollow: string
  ): Promise<[followerCount: number, followeeCount: number]> {
    return await this.changeFollow(
      token,
      userAliasToFollow,
      async (userAlias: string) => {
        await this.followDAO.deleteFollow(userAlias, userAliasToFollow);
        await this.userDAO.decrementNumFollowers(userAliasToFollow);
        await this.userDAO.decrementNumFollowees(userAlias);
      }
    );
  }

  public async unfollow(
    token: string,
    userAliasToUnfollow: string
  ): Promise<[followerCount: number, followeeCount: number]> {
    return await this.changeFollow(
      token,
      userAliasToUnfollow,
      async (userAlias: string) => {
        await this.followDAO.deleteFollow(userAlias, userAliasToUnfollow);
        await this.userDAO.decrementNumFollowers(userAliasToUnfollow);
        await this.userDAO.decrementNumFollowees(userAlias);
      }
    );
  }

  public async changeFollow(
    token: string,
    userAliasToPerformAction: string,
    uniqueMethods: (userAlias: string) => Promise<void>
  ): Promise<[followerCount: number, followeeCount: number]> {
    // add code with DAOs to decrement follower
    return await this.tryRequest(async () => {
      await this.verifyAuth(token);

      let userAlias = await this.authDAO.getAlias(token);

      if (!userAlias) {
        throw new BadRequest("User does not exist");
      }
      await uniqueMethods(userAlias);
      const { followerCount, followeeCount } = await this.getFollowCount(
        userAliasToPerformAction
      );
      return [followerCount, followeeCount];
    }, "Failed to change following");
  }

  private async getFollowCount(alias: string) {
    const followerCount = await this.tryRequest(async () => {
      return this.userDAO.getNumFollowers(alias);
    }, "Failed to get number of followers");

    const followeeCount = await this.tryRequest(async () => {
      return this.userDAO.getNumFollowees(alias);
    }, "Failed to get number of followees");

    console.log(
      "Here are the number of followers and followees",
      followerCount,
      followeeCount
    );
    return { followerCount, followeeCount };
  }

  private async getFakeData(
    lastItem: UserDto | null,
    pageSize: number,
    userAlias: string
  ): Promise<[UserDto[], boolean]> {
    const [items, hasMore] = FakeData.instance.getPageOfUsers(
      User.fromDto(lastItem),
      pageSize,
      userAlias
    );
    const dtos = items.map((user) => user.dto);
    return [dtos, hasMore];
  }
}
