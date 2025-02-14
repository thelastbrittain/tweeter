import { AuthToken, Status } from "tweeter-shared";

export const PAGE_SIZE = 10;

export interface StatusItemView {
  addItems: (newStatus: Status[]) => void;
  displayErrorMessage: (message: string) => void;
}

export abstract class StatusItemPresenter {
  private _lastItem: Status | null = null;
  private _hasMoreItems: boolean = true;
  private _view: StatusItemView;

  constructor(view: StatusItemView) {
    this._view = view;
  }

  public get hasMoreItems() {
    return this._hasMoreItems;
  }

  public set hasMoreItems(value: boolean) {
    this._hasMoreItems = value;
  }

  protected get lastItem() {
    return this._lastItem;
  }

  protected set lastItem(value: Status | null) {
    this._lastItem = value;
  }

  protected get view() {
    return this._view;
  }

  reset() {
    this._lastItem = null;
    this._hasMoreItems = true;
  }

  public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;
}
