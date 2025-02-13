import { AuthToken, Status } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
export const PAGE_SIZE = 10;

export interface StatusItemView {
  addItems: (newStatus: Status[]) => void;
  displayErrorMessage: (message: string) => void;
}

export class FeedItemPresenter {
  private statusService: StatusService;
  private lastItem: Status | null = null;
  private hasMoreItems: boolean = true;
  private view: StatusItemView;

  constructor(view: StatusItemView) {
    this.statusService = new StatusService();
    this.view = view;
  }

  private async loadMoreItems(authToken: AuthToken, userAlias: string) {
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
        `Failed to load  items because of exception: ${error}`
      );
    }
  }
}
