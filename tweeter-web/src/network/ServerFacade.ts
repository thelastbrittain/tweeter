import {
  GetBothCountResponse,
  GetFollowerCountResponse,
  GetIsFollowerRequest,
  GetIsFollowerResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  TweeterRequest,
  TweeterResponse,
  User,
  UserDto,
} from "tweeter-shared";
import { ClientCommunicator } from "./ClientCommunicator";

export class ServerFacade {
  private SERVER_URL =
    "https://fj4muh0114.execute-api.us-east-1.amazonaws.com/prod";

  private clientCommunicator = new ClientCommunicator(this.SERVER_URL);

  public async getMoreFollowees(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/followee/list");

    // Convert the UserDto array returned by ClientCommunicator to a User array
    const items: User[] | null = this.convertToUserArray(response);
    return this.handleGetError(response, items);
  }

  public async getMoreFollowers(
    request: PagedUserItemRequest
  ): Promise<[User[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedUserItemRequest,
      PagedUserItemResponse
    >(request, "/follower/list");

    const items: User[] | null = this.convertToUserArray(response);
    console.log("If the user has more or not: ", response.hasMore);
    return this.handleGetError(response, items);
  }

  public async getIsFollowerStatus(
    request: GetIsFollowerRequest
  ): Promise<boolean> {
    // TODO: Replace with the result of calling server
    const response = await this.clientCommunicator.doPost<
      GetIsFollowerRequest,
      GetIsFollowerResponse
    >(request, "/follower/status");

    if (response.success) {
      return response.isFollowing;
    } else {
      this.throwError<GetIsFollowerResponse>(response);
    }
  }

  public async getFollowerCount(request: TweeterRequest): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      TweeterRequest,
      GetFollowerCountResponse
    >(request, "/follower/count");
    if (response.success) {
      return response.count;
    } else {
      this.throwError(response);
    }
  }

  public async getFolloweeCount(request: TweeterRequest): Promise<number> {
    const response = await this.clientCommunicator.doPost<
      TweeterRequest,
      GetFollowerCountResponse
    >(request, "/followee/count");
    if (response.success) {
      console.log(response.count);
      return response.count;
    } else {
      this.throwError(response);
    }
  }

  public async follow(request: TweeterRequest): Promise<[number, number]> {
    const response = await this.clientCommunicator.doPost<
      TweeterRequest,
      GetBothCountResponse
    >(request, "/follower/follow");
    if (response.success) {
      return [response.followerCount, response.followeeCount];
    } else {
      this.throwError(response);
    }
  }

  public async unfollow(request: TweeterRequest): Promise<[number, number]> {
    const response = await this.clientCommunicator.doPost<
      TweeterRequest,
      GetBothCountResponse
    >(request, "/follower/unfollow");
    if (response.success) {
      return [response.followerCount, response.followeeCount];
    } else {
      this.throwError(response);
    }
  }

  private convertToUserArray(response: PagedUserItemResponse): User[] | null {
    return response.success && response.items
      ? response.items.map((dto) => User.fromDto(dto) as User)
      : null;
  }

  private handleGetError(
    response: PagedUserItemResponse,
    items: User[] | null
  ): [User[], boolean] {
    if (response.success) {
      if (items == null) {
        throw new Error(`No followees found`);
      } else {
        return [items, response.hasMore];
      }
    } else {
      this.throwError<PagedUserItemResponse>(response);
    }
  }

  private throwError<RES extends TweeterResponse>(response: RES): never {
    console.error(response);
    throw new Error(
      response.message ??
        "Unknown error, response.message is null in ServerFacade"
    );
  }
}
