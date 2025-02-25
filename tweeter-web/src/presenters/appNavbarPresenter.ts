import { AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { infoMessageView, Presenter } from "./Presenter";

export interface AppNavBarView extends infoMessageView {
  clearUserInfo: () => void;
}

export class AppNavbarPresenter extends Presenter<AppNavBarView> {
  private _userService: UserService;

  constructor(view: AppNavBarView) {
    super(view);
    this._userService = new UserService();
  }

  public async logOut(authToken: AuthToken) {
    this.view.displayInfoMessage("Logging Out...", 0);
    this.doFailureReportingOperation(async () => {
      await this.userService.logout(authToken!);
      this.view.clearLastInfoMessage();
      this.view.clearUserInfo();
    }, "log user out");
  }

  public get userService() {
    return this._userService;
  }
}
