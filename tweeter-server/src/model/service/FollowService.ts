import { AuthToken, FakeData, User, UserDto } from "tweeter-shared";

export class FollowService {
  public async loadMoreFollowers(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    return this.getFakeData(lastItem, pageSize, userAlias);
  }

  public async loadMoreFollowees(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: UserDto | null
  ): Promise<[UserDto[], boolean]> {
    return this.getFakeData(lastItem, pageSize, userAlias);
  }

  public async getIsFollowerStatus(
    token: string,
    userAlias: string,
    selectedUserAlias: string
  ): Promise<boolean> {
    // TODO: Replace with the result of calling server
    return FakeData.instance.isFollower();
  }

  public async getFolloweeCount(
    token: string,
    userAlias: string
  ): Promise<number> {
    return FakeData.instance.getFolloweeCount(userAlias);
  }

  public async getFollowerCount(
    token: string,
    userAlias: string
  ): Promise<number> {
    return FakeData.instance.getFollowerCount(userAlias);
  }

  public async follow(
    token: string,
    userAliasToUnfollow: string
  ): Promise<[followerCount: number, followeeCount: number]> {
    // add code with DAOs to increment followers
    const { followerCount, followeeCount } = await this.getFollowCount(
      token,
      userAliasToUnfollow
    );
    return [followerCount, followeeCount];
  }

  public async unfollow(
    token: string,
    userAliasToUnfollow: string
  ): Promise<[followerCount: number, followeeCount: number]> {
    // add code with DAOs to decrement followers
    const { followerCount, followeeCount } = await this.getFollowCount(
      token,
      userAliasToUnfollow
    );
    return [followerCount, followeeCount];
  }

  private async getFollowCount(token: string, userAliasToUnfollow: string) {
    const followerCount = await this.getFollowerCount(
      token,
      userAliasToUnfollow
    );
    const followeeCount = await this.getFolloweeCount(
      token,
      userAliasToUnfollow
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
