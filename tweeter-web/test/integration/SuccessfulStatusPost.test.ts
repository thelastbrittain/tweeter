import {
  AuthToken,
  LoginResponse,
  RegisterRequest,
  User,
  LoadMoreItemsRequest,
  StatusDto,
} from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";
import { PostStatusPresenter } from "../../src/presenters/PostStatusPresenter";
import { PostStatusView } from "../../src/presenters/PostStatusPresenter";
import "@testing-library/jest-dom";
import { anything, instance, mock, spy, verify } from "@typestrong/ts-mockito";

describe("Post Status Integration test", () => {
  const serverFacade = new ServerFacade();
  const fakePost = "This is a fake post";

  it("Post Status Success ", async () => {
    jest.setTimeout(10000); // 20 seconds

    let fakeNumber = generateRandomNumber();
    const registerRequest: RegisterRequest = {
      token: "doesn't exist yet",
      userAlias: `IntegrationTestAlias${fakeNumber}`,
      firstName: `IntegrationTestFirstName${fakeNumber}`,
      lastName: "IntegrationTest",
      userImageBytes: "fakeImage",
      imageFileExtension: ".png",
    };

    // need to register a user
    const [userDto, authDto] = await serverFacade.register(registerRequest);
    let auth = AuthToken.fromDto(authDto);
    let user = User.fromDto(userDto);
    // console.log(auth);
    expect(true).toBeTruthy;

    const mockedPostStatusView = mock<PostStatusView>();
    const instancePostStatusView = instance(mockedPostStatusView);

    // pass in the mock to the presenter
    const postStatusPresenter = new PostStatusPresenter(instancePostStatusView);
    await postStatusPresenter.submitPost(auth, fakePost, user);

    // need to make sure a message was displayed
    verify(
      mockedPostStatusView.displayInfoMessage(anything(), anything())
    ).twice();
    verify(mockedPostStatusView.displayErrorMessage(anything())).never();

    // retrieve the user's story and make sure details are correct
    let loadStoryRequest: LoadMoreItemsRequest = {
      token: auth.token,
      userAlias: user!.alias,
      pageSize: 1,
      lastItem: null,
    };
    const [statusDtos, unimportant] = await serverFacade.loadMoreStoryItems(
      loadStoryRequest
    );
    let status: StatusDto = statusDtos[0];
    // console.log(status);
    expect(status.post).toBe(fakePost);
  });
});

function generateRandomNumber(): number {
  return Math.floor(Math.random() * 10000) + 1;
}
