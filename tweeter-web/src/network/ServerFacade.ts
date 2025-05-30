import {
  AuthDto,
  GetBothCountResponse,
  GetFollowerCountResponse,
  GetIsFollowerRequest,
  GetIsFollowerResponse,
  GetUserResponse,
  LoadMoreItemsRequest,
  LoadMoreItemsResponse,
  LoginResponse,
  PagedUserItemRequest,
  PagedUserItemResponse,
  PostStatusRequest,
  RegisterRequest,
  StatusDto,
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

  //
  // Follow service methods
  //
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

  //
  // Status service methods
  //
  public async loadMoreStoryItems(
    request: LoadMoreItemsRequest
  ): Promise<[StatusDto[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      LoadMoreItemsRequest,
      LoadMoreItemsResponse
    >(request, "/status/story/load");
    if (response.success) {
      return [response.statuses, response.hasMorePages];
    } else {
      this.throwError(response);
    }
  }

  public async loadMoreFeedItems(
    request: LoadMoreItemsRequest
  ): Promise<[StatusDto[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      LoadMoreItemsRequest,
      LoadMoreItemsResponse
    >(request, "/status/feed/load");
    if (response.success) {
      return [response.statuses, response.hasMorePages];
    } else {
      this.throwError(response);
    }
  }

  public async postStatus(request: PostStatusRequest): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      PostStatusRequest,
      TweeterResponse
    >(request, "/status/post");
    if (response.success) {
      return;
    } else {
      this.throwError(response);
    }
  }

  //
  // UserService Methods
  //
  public async logout(request: TweeterRequest): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      TweeterRequest,
      TweeterResponse
    >(request, "/user/logout");
    if (response.success) {
      return;
    } else {
      this.throwError(response);
    }
  }

  public async login(request: TweeterRequest): Promise<[UserDto, AuthDto]> {
    const response = await this.clientCommunicator.doPost<
      TweeterRequest,
      LoginResponse
    >(request, "/user/login");
    if (response.success) {
      return [response.user, response.auth];
    } else {
      this.throwError(response);
    }
  }

  public async register(request: RegisterRequest): Promise<[UserDto, AuthDto]> {
    const response = await this.clientCommunicator.doPost<
      RegisterRequest,
      LoginResponse
    >(request, "/user/register");
    if (response.success) {
      return [response.user, response.auth];
    } else {
      this.throwError(response);
    }
  }

  public async getUser(request: TweeterRequest): Promise<UserDto | null> {
    const response = await this.clientCommunicator.doPost<
      TweeterRequest,
      GetUserResponse
    >(request, "/user/get");
    if (response.success && response.user) {
      return response.user;
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
