import { MemoryRouter } from "react-router-dom";
import Login from "../../../../src/components/authentication/login/Login";
import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { loginPresenter } from "../../../../src/presenters/LoginPresenter";
library.add(fab);
import { anything, instance, mock, verify } from "@typestrong/ts-mockito";

describe("Login Component", () => {
  it("starts with the sign-in button disabled", () => {
    const { signInButton } = renderLoginAndGetElements("/");
    expect(signInButton).toBeDisabled();
  });

  it("sign-in button enabled when alias and password fields have text", async () => {
    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElements("/");

    await user.type(aliasField, "a");
    await user.type(passwordField, "a");
    expect(signInButton).toBeEnabled();
  });

  it("disables sign in button if either field is cleared", async () => {
    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElements("/");

    await user.type(aliasField, "a");
    await user.type(passwordField, "a");
    expect(signInButton).toBeEnabled();

    await user.clear(aliasField);
    expect(signInButton).toBeDisabled();

    await user.type(aliasField, "a");
    expect(signInButton).toBeEnabled();

    await user.clear(passwordField);
    expect(signInButton).toBeDisabled();

    await user.type(passwordField, "a");
    expect(signInButton).toBeEnabled();
  });

  it("calls presenter method with correct parameters when sign-in button is pressed", async () => {
    const mockPresenter = mock<loginPresenter>();
    const mockPresenterInstance = instance(mockPresenter);
    const originalUrl = "/http://someurl.com";
    const alias = "myAlias";
    const password = "myPassword";

    const { signInButton, aliasField, passwordField, user } =
      renderLoginAndGetElements(originalUrl, mockPresenterInstance);

    await user.type(aliasField, alias);
    await user.type(passwordField, password);

    await user.click(signInButton);
    verify(
      mockPresenter.doLogin(alias, password, anything(), originalUrl)
    ).once();
  });
});

const renderLogin = (originalURL: string, presenter?: loginPresenter) => {
  return render(
    <MemoryRouter>
      {!!presenter ? (
        <Login originalUrl={originalURL} presenter={presenter} />
      ) : (
        <Login originalUrl={originalURL} />
      )}
    </MemoryRouter>
  );
};

const renderLoginAndGetElements = (
  originalUrl: string,
  presenter?: loginPresenter
) => {
  const user = userEvent.setup();
  renderLogin(originalUrl, presenter);

  const signInButton = screen.getByRole("button", { name: /Sign in/i });
  const aliasField = screen.getByLabelText("alias");
  const passwordField = screen.getByLabelText("password");

  return { signInButton, aliasField, passwordField, user };
};
