import { AuthToken, User } from "tweeter-shared";
import { Presenter, View } from "./Presenter";
import { UserService } from "../model/service/UserService";

export interface authenticationView extends View {
  navigate: (url: string) => void;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
}

export abstract class AuthenticationPresenter<
  V extends authenticationView
> extends Presenter<V> {
  private _userService: UserService;

  constructor(view: V) {
    super(view);
    this._userService = new UserService();
  }

  protected get userService(): UserService {
    return this._userService;
  }

  public async doAuthenticationOperation(
    message: string,
    rememberMe: boolean,
    originalUrl: string | undefined,
    authenticationFunction: () => Promise<[User, AuthToken]>
  ) {
    this.doFailureReportingOperation(async () => {
      const [user, authToken] = await authenticationFunction();
      this.view.updateUserInfo(user, user, authToken, rememberMe);
      this.navigate(originalUrl);
    }, message);
  }

  private navigate(originalUrl: string | undefined): void {
    if (originalUrl) {
      this.view.navigate(originalUrl);
    } else {
      this.view.navigate("/");
    }
  }
}
