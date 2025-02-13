import { AuthToken, Status } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";

export const PAGE_SIZE = 10;

export interface StatusItemView {
  addItems: (newStatus: Status[]) => void;
  displayErrorMessage: (message: string) => void;
}

export abstract class StatusItemPresenter {
  private lastItem: Status | null = null;
  private hasMoreItems: boolean = true;
  private view: StatusItemView;

  constructor(view: StatusItemView) {
    this.view = view;
  }

  public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;
}
