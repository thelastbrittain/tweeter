import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";

export interface userNavHookView {
  setDisplayedUser: (user: User) => void;
  displayErrorMessage: (message: string) => void;
}

export class userNavHookPresenter {
  private view: userNavHookView;
  private userService: UserService;

  constructor(view: userNavHookView) {
    this.view = view;
    this.userService = new UserService();
  }
  public extractAlias(value: string): string {
    const index = value.indexOf("@");
    return value.substring(index);
  }

  public async navToUser(
    authToken: AuthToken,
    aliasValue: string,
    currentUser: User
  ) {
    try {
      const alias = this.extractAlias(aliasValue);
      const user = await this.userService.getUser(authToken!, alias);

      if (!!user) {
        if (currentUser!.equals(user)) {
          this.view.setDisplayedUser(currentUser!);
        } else {
          this.view.setDisplayedUser(user);
        }
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get user because of exception: ${error}`
      );
    }
  }
}
