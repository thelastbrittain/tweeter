import { AuthDto, AuthToken, FakeData, User, UserDto } from "tweeter-shared";
import { BadRequest } from "../../Error/BadRequest";
import { StorageDAO } from "../../dataaccess/storage/StorageDAO";
import bcrypt = require("bcryptjs");
import { Service } from "./Service";

export class UserService extends Service {
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
    }, "Failed registering a user");
    const user: UserDto = {
      firstName: firstName,
      lastName: lastName,
      alias: alias,
      imageUrl: storageFileExtension,
    };

    return [user, authToken.toDto()];
  }

  public async getUser(token: string, alias: string): Promise<UserDto | null> {
    return await this.tryRequest(async () => {
      await this.verifyAuth(token);
      return await this.userDAO.getUser(alias);
    }, "Failed getting a user");
  }

  private async generateAndInsertAuth(alias: string): Promise<AuthToken> {
    const authToken = AuthToken.Generate();
    // put auth info into auth table
    await this.tryRequest(async () => {
      await this.authDAO.putAuth(alias, authToken.token);
    }, "Failed to put auth info into auth table");
    return authToken;
  }
}
