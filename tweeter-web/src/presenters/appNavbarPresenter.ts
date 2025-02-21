import { AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { infoMessageView, Presenter } from "./Presenter";

export interface appNavBarView extends infoMessageView {
  clearUserInfo: () => void;
}

export class appNavbarPresenter extends Presenter<appNavBarView> {
  userService: UserService;

  constructor(view: appNavBarView) {
    super(view);
    this.userService = new UserService();
  }

  public async logOut(authToken: AuthToken) {
    this.view.displayInfoMessage("Logging Out...", 0);
    this.doFailureReportingOperation(async () => {
      await this.userService.logout(authToken!);
      this.view.clearLastInfoMessage();
      this.view.clearUserInfo();
    }, "log use out");
  }
}
