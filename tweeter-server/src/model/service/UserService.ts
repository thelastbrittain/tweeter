import { AuthDto, AuthToken, FakeData, User, UserDto } from "tweeter-shared";
import { UserDAO } from "../../dataaccess/user/UserDAO";
import { BadRequest } from "../../Error/BadRequest";
import { ServerError } from "../../Error/ServerError";
import { StorageDAO } from "../../dataaccess/Storage/StorageDAO";
import bcrypt = require("bcryptjs");
import { AuthDAO } from "../../dataaccess/auth/AuthDAO";

export class UserService {
  private userDAO: UserDAO;
  private authDAO: AuthDAO;
  public constructor(userDAO: UserDAO, authDAO: AuthDAO) {
    this.userDAO = userDAO;
    this.authDAO = authDAO;
  }

  public async logout(token: string): Promise<void> {
    await this.authDAO.deleteAuth(token);
    return;
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[UserDto, AuthDto]> {
    // check if user exists
    const result = await this.userDAO.getAliasAndPassword(alias);
    if (!result || !result.alias || !result.password) {
      throw new BadRequest("Alias not correct");
    }

    // getting all the user data
    const user = await this.userDAO.getUser(alias);
    if (user === null) {
      throw new BadRequest("Invalid alias or password");
    }

    // make sure alias and password are correct
    let hashedPassword = result.password;
    bcrypt.compareSync(password, hashedPassword); // true // true is it's the right password
    if (!bcrypt.compareSync(password, hashedPassword)) {
      throw new BadRequest("Incorrect password");
    }

    // if correct, put auth into table
    const authToken: AuthToken = await this.generateAndInsertAuth(alias);

    return [user, authToken.toDto()];
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
        console.error("Alias already taken");
        throw new BadRequest("Alias already taken");
      }
    }, "");

    // imageFileExtension = putImageIntoS3(userImageBytes, some generatedName)
    let storageFileExtension = "";
    await this.tryRequest(async () => {
      storageFileExtension = await storageDAO.putImage(
        alias + "-profile-picture" + imageFileExtension,
        userImageBytes
      );
    }, "");

    // hash the password
    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);

    const authToken: AuthToken = await this.generateAndInsertAuth(alias);

    // try catch put all info into a user table (hash the password obvi)
    await this.tryRequest(async () => {
      await this.userDAO.putUser(
        firstName,
        lastName,
        alias,
        hashedPassword,
        storageFileExtension
      );
    }, "");

    // try catch put alias and token into auth database

    // put everything into a userdto, and return it
    const user: UserDto = {
      firstName: firstName,
      lastName: lastName,
      alias: alias,
      imageUrl: storageFileExtension,
    };

    return [user, authToken.toDto()];
  }

  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    return await this.userDAO.getUser(alias);
  }

  private async generateAndInsertAuth(alias: string): Promise<AuthToken> {
    const authToken = AuthToken.Generate();
    // put auth info into auth table
    await this.tryRequest(async () => {
      await this.authDAO.putAuth(alias, authToken.token);
    }, "Failed to put auth info into auth table");
    return authToken;
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
