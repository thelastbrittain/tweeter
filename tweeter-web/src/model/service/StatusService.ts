import {
  AuthToken,
  Status,
  FakeData,
  LoadMoreItemsRequest,
} from "tweeter-shared";
import { ServerFacade } from "../../network/ServerFacade";

export class StatusService {
  private serverFacade: ServerFacade;

  public constructor() {
    this.serverFacade = new ServerFacade();
  }
  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    let request: LoadMoreItemsRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null,
    };

    const [statusesDtos, hasMorePages] =
      await this.serverFacade.loadMoreStoryItems(request);
    let statuses = Status.toStatusArray(statusesDtos);
    return [statuses, hasMorePages];
  }

  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    // let request: LoadMoreItemsRequest = {
    //   token: authToken.token,
    //   userAlias: userAlias,
    //   pageSize: pageSize,
    //   lastItem: lastItem ? lastItem.dto : null,
    // };

    // const [statusesDtos, hasMorePages] =
    //   await this.serverFacade.loadMoreFeedItems(request);
    // let statuses = Status.toStatusArray(statusesDtos);
    // return [statuses, hasMorePages];
    const [statuses, hasMore] = FakeData.instance.getPageOfStatuses(
      lastItem,
      pageSize
    );
    console.log("This is the value of hasMore", hasMore);
    return [statuses, hasMore];
  }

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status
  ): Promise<void> {
    // Pause so we can see the logging out message. Remove when connected to the server
    await new Promise((f) => setTimeout(f, 2000));

    // TODO: Call the server to post the status
  }
}
