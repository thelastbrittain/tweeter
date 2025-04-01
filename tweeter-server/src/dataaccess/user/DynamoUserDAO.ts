import { UserDto } from "tweeter-shared";
import { UserDAO } from "./UserDAO";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BadRequest } from "../../Error/BadRequest";
import { ServerError } from "../../Error/ServerError";
export class DynamoUserDAO implements UserDAO {
  private client = DynamoDBDocumentClient.from(new DynamoDBClient());
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
      const result = await this.client.send(new GetCommand(params));
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
      await this.client.send(new PutCommand(params));
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
      const result = await this.client.send(new GetCommand(params));
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
      const result = await this.client.send(new GetCommand(params));
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
      await this.client.send(new UpdateCommand(params));
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
      const result = await this.client.send(new GetCommand(params));
      if (result.Item && result.Item[type] !== undefined) {
        return result.Item[type];
      } else {
        throw new BadRequest(
          `User with alias ${alias} not found or number of ${type} is undefined`
        );
      }
    }, `Failed to get number of ${type}`);
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
