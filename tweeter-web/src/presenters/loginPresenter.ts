import {
  AuthenticationPresenter,
  authenticationView,
} from "./AuthenticationPresenter";

export class loginPresenter extends AuthenticationPresenter<authenticationView> {
  public async doLogin(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl: string | undefined
  ) {
    this.doAuthenticationOperation(
      "log user in",
      rememberMe,
      originalUrl,
      () => {
        return this.userService.login(alias, password);
      }
    );
  }
}
