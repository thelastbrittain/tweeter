import { UserDto } from "tweeter-shared";
import { UserDAO } from "./UserDAO";
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";
import { BadRequest } from "../../Error/BadRequest";
import { DAO } from "../DAO";

export class DynamoUserDAO extends DAO implements UserDAO {
  readonly tableName = "tweeter-users";
  readonly aliasAttribute = "alias"; // sort key
  readonly firstNameAttribute = "firstName";
  readonly lastNameAttribute = "lastName";
  readonly passwordAttribute = "password";
  readonly imageFileExtensionAttribute = "imageFileExtension";
  readonly numFollowersAttribute = "numFollowers";
  readonly numFolloweesAttribute = "numFollowees";

  public async getUser(alias: string): Promise<UserDto | null> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.aliasAttribute]: alias,
      },
    };
    return await this.tryRequest(async () => {
      const result = await this.getClient().send(new GetCommand(params));
      if (result.Item) {
        const user: UserDto = {
          alias: result.Item[this.aliasAttribute],
          firstName: result.Item[this.firstNameAttribute],
          lastName: result.Item[this.lastNameAttribute],
          imageUrl: result.Item[this.imageFileExtensionAttribute],
        };
        return user;
      } else {
        throw new BadRequest("");
      }
    }, "Failed to retreive a user");
  }

  public async batchGetUser(aliases: string[]): Promise<UserDto[]> {
    if (aliases.length === 0) {
      return [];
    }

    const requestItems = {
      [this.tableName]: {
        Keys: aliases.map((alias) => ({
          [this.aliasAttribute]: alias,
        })),
      },
    };

    return await this.tryRequest(async () => {
      const result = await this.getClient().send(
        new BatchGetCommand({ RequestItems: requestItems })
      );

      const items = result.Responses?.[this.tableName] || [];

      const users: UserDto[] = items.map((item) => ({
        alias: item[this.aliasAttribute],
        firstName: item[this.firstNameAttribute],
        lastName: item[this.lastNameAttribute],
        imageUrl: item[this.imageFileExtensionAttribute],
      }));

      return users;
    }, "Failed to retrieve users");
  }

  public async putUser(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageFileExtension: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.aliasAttribute]: alias,
        [this.firstNameAttribute]: firstName,
        [this.lastNameAttribute]: lastName,
        [this.passwordAttribute]: password,
        [this.imageFileExtensionAttribute]: imageFileExtension,
        [this.numFollowersAttribute]: 0,
        [this.numFolloweesAttribute]: 0,
      },
    };
    await this.tryRequest(async () => {
      await this.getClient().send(new PutCommand(params));
      return;
    }, "Failed to put user");
  }

  public async getNumFollowers(alias: string): Promise<number> {
    return await this.getNumFollows(alias, this.numFollowersAttribute);
  }

  public async getNumFollowees(alias: string): Promise<number> {
    return await this.getNumFollows(alias, this.numFolloweesAttribute);
  }

  public async incrementNumFollowers(alias: string): Promise<void> {
    return await this.changeNumFollows(alias, this.numFollowersAttribute, 1);
  }

  public async incrementNumFollowees(alias: string): Promise<void> {
    return await this.changeNumFollows(alias, this.numFolloweesAttribute, 1);
  }

  public async decrementNumFollowers(alias: string): Promise<void> {
    return await this.changeNumFollows(alias, this.numFollowersAttribute, -1);
  }
  public async decrementNumFollowees(alias: string): Promise<void> {
    return await this.changeNumFollows(alias, this.numFolloweesAttribute, -1);
  }

  public async aliasExists(alias: string): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.aliasAttribute]: alias,
      },
    };
    return await this.tryRequest(async () => {
      const result = await this.getClient().send(new GetCommand(params));
      return !!result.Item;
    }, "Failed to check if alias exists. ");
  }

  public async getAliasAndPassword(
    alias: string
  ): Promise<{ alias: string; password: string } | null> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.aliasAttribute]: alias,
      },
      ProjectionExpression: `${this.aliasAttribute}, ${this.passwordAttribute}`,
    };
    return await this.tryRequest(async () => {
      const result = await this.getClient().send(new GetCommand(params));
      if (result.Item) {
        return {
          alias: result.Item[this.aliasAttribute],
          password: result.Item[this.passwordAttribute],
        };
      } else {
        return null;
      }
    }, "Failed to get alias and password");
  }

  private async changeNumFollows(
    alias: string,
    type: string,
    quantity: number
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.aliasAttribute]: alias,
      },
      UpdateExpression: `ADD ${type} :inc`,
      ExpressionAttributeValues: {
        ":inc": quantity,
      },
    };
    return this.tryRequest(async () => {
      await this.getClient().send(new UpdateCommand(params));
    }, `Failed to update ${type}`);
  }

  private async getNumFollows(alias: string, type: string): Promise<number> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.aliasAttribute]: alias,
      },
      ProjectionExpression: type,
    };
    return await this.tryRequest(async () => {
      const result = await this.getClient().send(new GetCommand(params));
      if (!result.Item) {
        throw new BadRequest(`User with alias ${alias} not found`);
      }
      return result.Item[type] ?? 0;
    }, `Failed to get number of ${type}`);
  }
}
