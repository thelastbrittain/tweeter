import { AuthDto, AuthToken, FakeData, User, UserDto } from "tweeter-shared";
import { Buffer, SlowBuffer } from "buffer";
import { UserDAO } from "../../dataaccess/user/UserDAO";
import { BadRequest } from "../../Error/BadRequest";
import { ServerError } from "../../Error/ServerError";
import { StorageDAO } from "../../dataaccess/Storage/StorageDAO";

export class UserService {
  private userDAO: UserDAO;
  public constructor(userDAO: UserDAO) {
    this.userDAO = userDAO;
  }

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
    imageFileExtension: string,
    storageDAO: StorageDAO
  ): Promise<[UserDto, AuthDto]> {
    // if alias already taken, error
    await this.tryRequest(async () => {
      const aliasTaken = await this.userDAO.aliasExists(alias);
      if (aliasTaken) {
        throw new BadRequest("Alias already taken");
      }
    }, "");

    // imageFileExtension = putImageIntoS3(userImageBytes, some generatedName)
    let storageFileExtension = "";
    await this.tryRequest(async () => {
      storageFileExtension = await storageDAO.putImage(
        alias + "-profile-picture",
        userImageBytes
      );
    }, "");

    // hash the password

    // try catch put all info into a user table (hash the password obvi)
    await this.tryRequest(async () => {
      await this.userDAO.putUser(
        firstName,
        lastName,
        alias,
        password,
        storageFileExtension
      );
    }, "");

    // try catch put alias and token into auth database

    // put everything into a userdto, and return it
    const user: UserDto = {
      firstName: firstName,
      lastName: lastName,
      alias: alias,
      imageUrl: imageFileExtension,
    };

    return [user, FakeData.instance.authToken.toDto()];
  }

  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    return FakeData.instance.findUserByAlias(alias)?.dto!;
  }

  private async tryRequest<R>(
    method: () => Promise<R>,
    errorMessage: string
  ): Promise<R> {
    try {
      return await method();
    } catch (error) {
      console.error(errorMessage + error);
      if (error! instanceof BadRequest) {
        throw new ServerError("");
      }
      throw error;
    }
  }
}
