import { useState } from "react";

interface Props {
  alias: String;
  setAlias: (newAlias: string) => void;
  password: String;
  setPassword: (newPassword: string) => void;
  checkSubmitButtonStatus: () => boolean;
  doLogin: () => void;
}

const AuthenticationFields = (props: Props) => {
  const loginOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key == "Enter" && !props.checkSubmitButtonStatus()) {
      props.doLogin();
    }
  };

  return (
    <>
      <div className="form-floating">
        <input
          type="text"
          className="form-control"
          size={50}
          id="aliasInput"
          aria-label="alias"
          placeholder="name@example.com"
          onKeyDown={loginOnEnter}
          onChange={(event) => props.setAlias(event.target.value)}
        />
        <label htmlFor="aliasInput">Alias</label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="password"
          className="form-control bottom"
          id="passwordInput"
          aria-label="password"
          placeholder="Password"
          onKeyDown={loginOnEnter}
          onChange={(event) => props.setPassword(event.target.value)}
        />
        <label htmlFor="passwordInput">Password</label>
      </div>
    </>
  );
};

export default AuthenticationFields;
