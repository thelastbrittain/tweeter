import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { AuthDAO } from "./AuthDAO";
import { DAO } from "../DAO";
export class DynamoAuthDAO extends DAO implements AuthDAO {
  readonly tableName = "tweeter-auth";
  readonly tokenAttribute = "token";
  readonly aliasAttribute = "alias";
  readonly dateLastAccessedAttribute = "dateLastAccessed";

  // when registering or logging in, will need to insert into the table
  public async putAuth(alias: string, token: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.tokenAttribute]: token,
        [this.aliasAttribute]: alias,
        [this.dateLastAccessedAttribute]: Date.now(),
      },
    };
    await this.tryRequest(async () => {
      await this.getClient().send(new PutCommand(params));
      return;
    }, "Failed to put auth");
  }

  public async deleteAuth(token: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.tokenAttribute]: token,
      },
    };
    await this.tryRequest(async () => {
      await this.getClient().send(new DeleteCommand(params));
    }, "Failed to delete auth");
  }

  public async getTimeStamp(token: string): Promise<number | null> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.tokenAttribute]: token,
      },
      ProjectionExpression: `${this.dateLastAccessedAttribute}`,
    };
    return await this.tryRequest(async () => {
      const result = await this.getClient().send(new GetCommand(params));
      if (result.Item) {
        return result.Item[this.dateLastAccessedAttribute];
      } else {
        return null;
      }
    }, "Failed to get token date last accessed");
  }

  public async updateTimeStamp(token: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.tokenAttribute]: token,
      },
      UpdateExpression: `SET #dateLastAccessed = :dateValue`,
      ExpressionAttributeNames: {
        "#dateLastAccessed": this.dateLastAccessedAttribute,
      },
      ExpressionAttributeValues: {
        ":dateValue": Date.now(),
      },
    };
    return await this.tryRequest(async () => {
      const result = await this.getClient().send(new UpdateCommand(params));
    }, "Failed to update token date last accessed");
  }
}
