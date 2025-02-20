import { AuthToken, Status } from "tweeter-shared";
import { StatusItemPresenter } from "./StatusItemPresenter";
import { PAGE_SIZE } from "../PagedItemPresenter";

export class FeedItemPresenter extends StatusItemPresenter {
  protected getItemDescription(): string {
    return "load feed items";
  }
  protected getMoreItems(
    authToken: AuthToken,
    userAlias: string
  ): Promise<[Status[], boolean]> {
    return this.service.loadMoreFeedItems(
      authToken!,
      userAlias,
      PAGE_SIZE,
      this.lastItem
    );
  }
}
