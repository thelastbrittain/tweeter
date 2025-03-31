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
    try {
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
        return null;
      }
    } catch (error) {
      console.error("Failed to retreive a user", error);
      return null; // change to a throw if neccesary
    }
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
    await this.client.send(new PutCommand(params));
    return;
  }

  public async getNumFollowers(alias: string): Promise<number> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.aliasAttribute]: alias,
      },
      ProjectionExpression: this.numFollowersAttribute,
    };

    try {
      const result = await this.client.send(new GetCommand(params));
      if (
        result.Item &&
        result.Item[this.numFollowersAttribute] !== undefined
      ) {
        return result.Item[this.numFollowersAttribute];
      } else {
        throw new Error(
          `User with alias ${alias} not found or numFollowees is undefined`
        );
      }
    } catch (error) {
      console.error("Error retrieving numFollowees:", error);
      return 50;
    }
  }

  public async getNumFollowees(alias: string): Promise<number> {
    return 5;
  }

  //   private getItem<T>(
  //     tableName: string,
  //     keyAttribute: string,
  //     projectionExpression: string | null,
  //     errorMessage: string
  //   ): Promise<T> {

  //   }

  public async incrementNumFollowers(alias: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.aliasAttribute]: alias,
      },
      UpdateExpression: `ADD ${this.numFollowersAttribute} :inc`,
      ExpressionAttributeValues: {
        ":inc": 1,
      },
    };

    try {
      await this.client.send(new UpdateCommand(params));
    } catch (error) {
      console.error("Failed to increment Follower Count:", error);
    }

    return;
  }
  public async incrementNumFolloees(alias: string): Promise<void> {
    return;
  }
  public async decrementNumFollowers(alias: string): Promise<void> {
    return;
  }
  public async decrementNumFollowees(alias: string): Promise<void> {
    return;
  }
}
