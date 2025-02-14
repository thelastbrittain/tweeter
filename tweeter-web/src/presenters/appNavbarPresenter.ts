import { AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";

export interface appNavBarView {
  displayInfoMessage: (message: string, duration: number) => void;
  clearLastInfoMessage: () => void;
  clearUserInfo: () => void;
  displayErrorMessage: (message: string) => void;
}

export class appNavbarPresenter {
  view: appNavBarView;
  userService: UserService;

  constructor(view: appNavBarView) {
    this.view = view;
    this.userService = new UserService();
  }

  public async logOut(authToken: AuthToken) {
    this.view.displayInfoMessage("Logging Out...", 0); // view call

    try {
      await this.userService.logout(authToken!); // service call

      this.view.clearLastInfoMessage(); // view call
      this.view.clearUserInfo(); // view call
    } catch (error) {
      this.view.displayErrorMessage(
        // view
        `Failed to log user out because of exception: ${error}`
      );
    }
  }
}
