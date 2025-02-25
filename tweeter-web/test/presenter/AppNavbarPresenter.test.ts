import {
  anything,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import {
  AppNavbarPresenter,
  AppNavBarView,
} from "../../src/presenters/AppNavbarPresenter";
import { AuthToken } from "tweeter-shared";
import { UserService } from "../../src/model/service/UserService";

describe("AppNavbarPresenter", () => {
  let mockAppNavBarView: AppNavBarView;
  let appNavbarPresenter: AppNavbarPresenter;
  let mockUserService: UserService;

  const authToken = new AuthToken("12345", Date.now());

  beforeEach(() => {
    mockAppNavBarView = mock<AppNavBarView>();
    const mockAppNavBarViewInstance = instance(mockAppNavBarView);

    const appNavbarPresenterSpy = spy(
      new AppNavbarPresenter(mockAppNavBarViewInstance)
    );
    appNavbarPresenter = instance(appNavbarPresenterSpy);

    mockUserService = mock<UserService>();
    const mockUserServiceInstance = instance(mockUserService);

    when(appNavbarPresenterSpy.userService).thenReturn(mockUserServiceInstance);
  });

  it("tells the view to display a logging out message", async () => {
    await appNavbarPresenter.logOut(authToken);
    verify(mockAppNavBarView.displayInfoMessage("Logging Out...", 0)).once();
  });

  it("calls logout on the user service with the correct auth token ", async () => {
    await appNavbarPresenter.logOut(authToken);
    verify(mockUserService.logout(authToken)).once();
  });

  it("when logout successful, the presenter tells the view to clear the last info message and clear the user info.", async () => {
    await appNavbarPresenter.logOut(authToken);
    verify(mockAppNavBarView.clearLastInfoMessage()).once();
    verify(mockAppNavBarView.clearUserInfo()).once();
    verify(mockAppNavBarView.displayErrorMessage(anything())).never;
  });

  it("when logout unsuccessful, presenter tells the view to display an error message and clear the last info message and does not tell it to clear the post or display a status posted message", async () => {
    const error = new Error("An error occured");
    when(mockUserService.logout(authToken)).thenThrow(error);

    await appNavbarPresenter.logOut(authToken);

    verify(
      mockAppNavBarView.displayErrorMessage(
        `Failed to log user out because of exception: ${error.message}`
      )
    ).once;
    verify(mockAppNavBarView.clearLastInfoMessage()).never();
    verify(mockAppNavBarView.clearUserInfo()).never();
  });
});
