import PostStatus from "../../../src/components/postStatus/PostStatus";
import { render, screen } from "@testing-library/react";
import { PostStatusPresenter } from "../../../src/presenters/PostStatusPresenter";
import useUserInfo from "../../../src/components/userInfo/UserInfoHook";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import { AuthToken, User } from "tweeter-shared";
import "@testing-library/jest-dom";
import { anything, instance, mock, verify } from "@typestrong/ts-mockito";

jest.mock("../../../src/components/userInfo/UserInfoHook", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserInfoHook"),
  __esModule: true,
  default: jest.fn(),
}));

describe("Post Status Component", () => {
  let mockUserInstance = new User("first", "last", "alias", "image");
  let mockAuthTokenInstance = new AuthToken("12345", Date.now());

  beforeAll(() => {
    (useUserInfo as jest.Mock).mockReturnValue({
      currentUser: mockUserInstance,
      authToken: mockAuthTokenInstance,
    });
  });

  it("Post Status and Clear buttons disabled at render", () => {
    const { postStatusButton, clearButton } = renderPostStatusAndGetElements();
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("Post Status and Clear buttons enabled when text in textField", async () => {
    const { postStatusButton, clearButton, textField, user } =
      renderPostStatusAndGetElements();
    await user.type(textField, "a post");

    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });

  it("Post Status and Clear buttons disabled when text cleared in textField", async () => {
    const { postStatusButton, clearButton, textField, user } =
      renderPostStatusAndGetElements();
    await user.type(textField, "a post");
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();

    await user.clear(textField);
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });
  it("postStatus method called with correct params when Post Status button pressed", async () => {
    const mockPresenter = mock<PostStatusPresenter>();
    const mockPresenterIntance = instance(mockPresenter);
    const { postStatusButton, textField, user } =
      renderPostStatusAndGetElements(mockPresenterIntance);
    let post = "a post";
    await user.type(textField, post);
    await user.click(postStatusButton);
    verify(
      mockPresenter.submitPost(mockAuthTokenInstance, post, mockUserInstance)
    ).once();
  });
});

const renderPostStatus = (presenter?: PostStatusPresenter) => {
  return render(
    <MemoryRouter>
      {!!presenter ? <PostStatus presenter={presenter} /> : <PostStatus />}
    </MemoryRouter>
  );
};

const renderPostStatusAndGetElements = (presenter?: PostStatusPresenter) => {
  const user = userEvent.setup();
  renderPostStatus(presenter);

  const postStatusButton = screen.getByRole("button", { name: /post status/i });
  const clearButton = screen.getByRole("button", { name: /clear/i });
  const textField = screen.getByRole("textbox");

  return { postStatusButton, clearButton, textField, user };
};
