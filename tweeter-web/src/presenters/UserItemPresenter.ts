import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";

export interface UserItemView {
  addItems: (newItems: User[]) => void;
  displayErrorMessage: (message: string) => void;
}

export abstract class UserItemPresenter {
  private _hasMoreItems = true;
  private _lastItem: User | null = null;

  private _view: UserItemView;

  protected constructor(view: UserItemView) {
    this._view = view;
  }

  protected get view() {
    return this._view;
  }

  reset() {
    this._lastItem = null;
    this._hasMoreItems = true;
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

  protected set lastItem(value: User | null) {
    this._lastItem = value;
  }

  public abstract loadMoreItems(authToken: AuthToken, userAlias: string): void;
}
