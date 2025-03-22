import { AuthToken, Status, FakeData, StatusDto } from "tweeter-shared";

export class StatusService {
  public async loadMoreStoryItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[StatusDto[], boolean]> {
    return this.getFakeItems(lastItem, pageSize);
  }

  public async loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[StatusDto[], boolean]> {
    return this.getFakeItems(lastItem, pageSize);
  }

  private getFakeItems(
    lastItem: Status | null,
    pageSize: number
  ): [StatusDto[], boolean] {
    const [statuses, hasMore] = FakeData.instance.getPageOfStatuses(
      lastItem,
      pageSize
    );
    const statusDtos = statuses.map((status) => status.dto);
    return [statusDtos, hasMore];
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
