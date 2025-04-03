import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { Presenter, View } from "./Presenter";

export interface userNavHookView extends View {
  setDisplayedUser: (user: User) => void;
}

export class userNavHookPresenter extends Presenter<userNavHookView> {
  private userService: UserService;

  constructor(view: userNavHookView) {
    super(view);
    this.userService = new UserService();
  }
  public extractAlias(value: string): string {
    if (value.includes("@")) {
      const index = value.indexOf("@");
      return value.substring(index + 1);
    } else {
      return value.substring(value.lastIndexOf("/") + 1);
    }
  }

  public async navToUser(
    authToken: AuthToken,
    aliasValue: string,
    currentUser: User
  ) {
    this.doFailureReportingOperation(async () => {
      const alias = this.extractAlias(aliasValue);
      const user = await this.userService.getUser(authToken!, alias);

      if (!!user) {
        if (currentUser!.equals(user)) {
          this.view.setDisplayedUser(currentUser!);
        } else {
          this.view.setDisplayedUser(user);
        }
      }
    }, "get user");
  }
}
