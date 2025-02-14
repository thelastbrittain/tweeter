import { AuthToken, Status } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { StatusItemPresenter, StatusItemView } from "./StatusItemPresenter";
export const PAGE_SIZE = 10;

export class FeedItemPresenter extends StatusItemPresenter {
  private statusService: StatusService;

  constructor(view: StatusItemView) {
    super(view);
    this.statusService = new StatusService();
  }

  public async loadMoreItems(authToken: AuthToken, userAlias: string) {
    try {
      const [newItems, hasMore] = await this.statusService.loadMoreFeedItems(
        authToken!,
        userAlias,
        PAGE_SIZE,
        this.lastItem
      );

      this.hasMoreItems = hasMore;
      this.lastItem = newItems[newItems.length - 1];

      this.view.addItems(newItems);
      //   setChangedDisplayedUser(false);  This will be kept in the component
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to load feed items because of exception: ${error}`
      );
    }
  }
}
