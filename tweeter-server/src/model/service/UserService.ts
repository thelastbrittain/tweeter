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
    // if missing information throw error

    // imageFileExtension = putImageIntoS3(userImageBytes, some generatedName)

    // try catch put all info into a user table (hash the password obvi)

    // try catch put alias and token into auth database

    // put everything into a userdto, and return it

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
