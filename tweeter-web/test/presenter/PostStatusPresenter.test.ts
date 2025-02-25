import {
  anything,
  capture,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../../src/presenters/PostStatusPresenter";
import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../../src/model/service/StatusService";

describe("PostStatusPresenter", () => {
  let mockPostStatusView: PostStatusView;
  let postStatusPresenter: PostStatusPresenter;
  let mockStatusService: StatusService;

  const authToken = new AuthToken("12345", Date.now());
  const post: string = "New Post";
  const user: User = new User("first", "last", "alias", "image_url");

  beforeEach(() => {
    mockPostStatusView = mock<PostStatusView>();
    const mockPostStatusViewInstance = instance(mockPostStatusView);

    const postStatusPresenterSpy = spy(
      new PostStatusPresenter(mockPostStatusViewInstance)
    );
    postStatusPresenter = instance(postStatusPresenterSpy);

    mockStatusService = mock<StatusService>();
    const mockUserServiceInstance = instance(mockStatusService);

    when(postStatusPresenterSpy.statusService).thenReturn(
      mockUserServiceInstance
    );
  });

  it("tells the view to display a posting status message", async () => {
    await postStatusPresenter.submitPost(authToken, post, user);
    verify(
      mockPostStatusView.displayInfoMessage("Posting status...", 0)
    ).once();
  });

  it("calls postStatus on the post status service with the correct status string and auth token ", async () => {
    await postStatusPresenter.submitPost(authToken, post, user);
    verify(mockStatusService.postStatus(authToken, anything())).once();
    let [, capturedStatus] = capture(mockStatusService.postStatus).last();
    expect((capturedStatus as Status).post).toEqual(post);
  });

  it("when posting of the status is successful, the presenter tells the view to clear the last info message, clear the post, and display a status posted message", async () => {
    await postStatusPresenter.submitPost(authToken, post, user);
    verify(mockPostStatusView.clearLastInfoMessage()).once();
    verify(mockPostStatusView.setPost("")).once();
    verify(
      mockPostStatusView.displayInfoMessage("Status posted!", 2000)
    ).once();
    verify(mockPostStatusView.displayErrorMessage(anything())).never;
  });

  it("when posting of the status is not successful, the presenter tells the view to display an error message and clear the last info message and does not tell it to clear the post or display a status posted message", async () => {
    const error = new Error("An error occured");
    when(mockStatusService.postStatus(authToken, anything())).thenThrow(error);
    await postStatusPresenter.submitPost(authToken, post, user);

    verify(
      mockPostStatusView.displayErrorMessage(
        `Failed to post the status because of exception: ${error.message}`
      )
    ).once;
    verify(mockPostStatusView.clearLastInfoMessage()).once();

    verify(mockPostStatusView.setPost("")).never();
    verify(
      mockPostStatusView.displayInfoMessage("Status posted!", 2000)
    ).never();
  });
});
