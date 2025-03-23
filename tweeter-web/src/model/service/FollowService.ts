import {
  AuthToken,
  GetIsFollowerRequest,
  PagedUserItemRequest,
  TweeterRequest,
  User,
  UserDto,
} from "tweeter-shared";
import { ServerFacade } from "../../network/ServerFacade";

export class FollowService {
  private serverFacade: ServerFacade;

  public constructor() {
    this.serverFacade = new ServerFacade();
  }
  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    // TODO: Replace with the result of calling server
    let request: PagedUserItemRequest = this.generatePagesUserReq(
      lastItem,
      authToken,
      userAlias,
      pageSize
    );
    const [users, hasMore] = await this.serverFacade.getMoreFollowers(request);
    return [users, hasMore];
  }

  private generatePagesUserReq(
    lastItem: User | null,
    authToken: AuthToken,
    userAlias: string,
    pageSize: number
  ): PagedUserItemRequest {
    let lastItemDto: null | UserDto = null;
    if (lastItem) {
      lastItemDto = lastItem.dto;
    }
    let request: PagedUserItemRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItemDto,
    };
    return request;
  }

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: User | null
  ): Promise<[User[], boolean]> {
    let request: PagedUserItemRequest = this.generatePagesUserReq(
      lastItem,
      authToken,
      userAlias,
      pageSize
    );

    const [users, hasMore] = await this.serverFacade.getMoreFollowees(request);
    return [users, hasMore];
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    let request: GetIsFollowerRequest = {
      token: authToken.token,
      userAlias: user.alias,
      selectedUserAlias: selectedUser.alias,
    };
    const isFollower = await this.serverFacade.getIsFollowerStatus(request);
    return isFollower;
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    let request: TweeterRequest = {
      token: authToken.token,
      userAlias: user.alias,
    };
    const count = await this.serverFacade.getFolloweeCount(request);
    console.log("Followee count is: ", count);
    return count;
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    let request: TweeterRequest = {
      token: authToken.token,
      userAlias: user.alias,
    };
    const count = await this.serverFacade.getFollowerCount(request);
    console.log("Follower count is: ", count);
    return count;
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const request: TweeterRequest = {
      token: authToken.token,
      userAlias: userToFollow.alias,
    };
    const [followerCount, followeeCount] = await this.serverFacade.follow(
      request
    );

    return [followerCount, followeeCount];
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    const request: TweeterRequest = {
      token: authToken.token,
      userAlias: userToUnfollow.alias,
    };
    const [followerCount, followeeCount] = await this.serverFacade.unfollow(
      request
    );

    return [followerCount, followeeCount];
  }
}
