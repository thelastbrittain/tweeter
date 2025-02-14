import { User, AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";

export interface loginView {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  navigate: (url: string) => void;
  displayErrorMessage: (message: string) => void;
}

export class loginPresenter {
  private userService: UserService;
  private view: loginView;

  constructor(view: loginView) {
    this.view = view;
    this.userService = new UserService();
  }

  public async doLogin(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl: string | undefined
  ) {
    try {
      const [user, authToken] = await this.userService.login(alias, password);

      this.view.updateUserInfo(user, user, authToken, rememberMe);

      if (originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate("/");
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to log user in because of exception: ${error}`
      );
    } finally {
    }
  }
}
