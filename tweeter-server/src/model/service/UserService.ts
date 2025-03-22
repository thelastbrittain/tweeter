import { AuthDto, AuthToken, FakeData, User, UserDto } from "tweeter-shared";
import { Buffer } from "buffer";

export class UserService {
  public async logout(token: string): Promise<void> {
    return;
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[UserDto, AuthDto]> {
    // TODO: Replace with the result of calling the server
    const user = FakeData.instance.firstUser;

    if (user === null) {
      throw new Error("Invalid alias or password");
    }

    return [user.dto, FakeData.instance.authToken.toDto()];
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: string,
    imageFileExtension: string
  ): Promise<[UserDto, AuthDto]> {
    // will need to turn userImageBytest back into Bytes

    const user = FakeData.instance.firstUser;

    if (user === null) {
      throw new Error("Invalid registration");
    }

    return [user.dto, FakeData.instance.authToken.toDto()];
  }

  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    return FakeData.instance.findUserByAlias(alias)?.dto!;
  }
}
