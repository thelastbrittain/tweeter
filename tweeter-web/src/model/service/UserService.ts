import {
  AuthToken,
  FakeData,
  RegisterRequest,
  TweeterRequest,
  User,
} from "tweeter-shared";
import { Buffer } from "buffer";
import { ServerFacade } from "../../network/ServerFacade";

export class UserService {
  private serverFacade: ServerFacade;

  public constructor() {
    this.serverFacade = new ServerFacade();
  }

  public async logout(authToken: AuthToken): Promise<void> {
    let request: TweeterRequest = {
      userAlias: "GibberishUserAliasNotNeeded",
      token: authToken.token,
    };
    await this.serverFacade.logout(request);
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    // TODO: Replace with the result of calling the server
    let request: TweeterRequest = {
      userAlias: alias,
      token: password,
    };

    const [userDto, authDto] = await this.serverFacade.login(request);
    return [User.fromDto(userDto)!, AuthToken.fromDto(authDto)];
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytes: Uint8Array,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    // Not neded now, but will be needed when you make the request to the server in milestone 3
    const imageStringBase64: string =
      Buffer.from(userImageBytes).toString("base64");

    let request: RegisterRequest = {
      userAlias: alias,
      token: password,
      firstName: firstName,
      lastName: lastName,
      userImageBytes: imageStringBase64,
      imageFileExtension: imageFileExtension,
    };

    const [userDto, authDto] = await this.serverFacade.register(request);
    return [User.fromDto(userDto)!, AuthToken.fromDto(authDto)];
  }

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    let request: TweeterRequest = {
      userAlias: alias,
      token: authToken.token,
    };

    const userDto = await this.serverFacade.getUser(request);
    return User.fromDto(userDto);
  }
}
