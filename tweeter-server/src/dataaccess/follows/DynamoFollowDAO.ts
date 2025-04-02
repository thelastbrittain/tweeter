import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DAO } from "../DAO";
import { FollowDAO } from "./FollowDAO";
import { UserDto } from "tweeter-shared";

export class DynamoFollowDAO extends DAO implements FollowDAO {
  readonly tableName = "tweeter-follow";
  readonly followerAttribute = "followerAlias";
  readonly followeeAttribute = "followeeAlias";
  readonly indexName = "followeeAlias-followerAlias-index";

  public async putFollow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.followerAttribute]: followerAlias,
        [this.followeeAttribute]: followeeAlias,
      },
    };
    await this.tryRequest(async () => {
      await this.getClient().send(new PutCommand(params));
      return;
    }, "Failed to put follow");
  }

  public async deleteFollow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerAttribute]: followerAlias,
        [this.followeeAttribute]: followeeAlias,
      },
    };
    await this.tryRequest(async () => {
      const result = await this.getClient().send(new DeleteCommand(params));
    }, "Failed to delete follow");
  }

  public async getFollow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<{ follower: string; followee: string } | null> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerAttribute]: followerAlias,
        [this.followeeAttribute]: followeeAlias,
      },
    };
    return await this.tryRequest(async () => {
      const result = await this.getClient().send(new GetCommand(params));
      if (result.Item) {
        let follower: string = result.Item[this.followerAttribute];
        let followee: string = result.Item[this.followeeAttribute];
        return {
          follower,
          followee,
        };
      } else {
        return null;
      }
    }, "Failed to get follow");
  }

  public async getPageOfFollowees(
    alias: string,
    pageSize: number,
    lastAlias: string | null
  ): Promise<[string[], boolean]> {
    return await this.getPageOfFollows(
      this.followerAttribute,
      alias,
      this.followeeAttribute,
      pageSize,
      lastAlias
    );
  }

  public async getPageOfFollowers(
    alias: string,
    pageSize: number,
    lastAlias: string | null
  ): Promise<[string[], boolean]> {
    return await this.getPageOfFollows(
      this.followeeAttribute,
      alias,
      this.followerAttribute,
      pageSize,
      lastAlias,
      this.indexName
    );
  }

  private async getPageOfFollows(
    partitionKey: string,
    partitionKeyValue: string,
    sortKey: string,
    pageSize: number,
    lastSortKey: string | null,
    indexName?: string
  ): Promise<[string[], boolean]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "#partitionKey = :partitionValue",
      ExpressionAttributeNames: {
        "#partitionKey": partitionKey,
      },
      ExpressionAttributeValues: {
        ":partitionValue": partitionKeyValue,
      },
      Limit: pageSize,
    };
    if (indexName) {
      params.IndexName = indexName;
    }

    if (lastSortKey) {
      params.ExclusiveStartKey = {
        [partitionKey]: partitionKeyValue,
        [sortKey]: lastSortKey,
      };
    }
    return await this.tryRequest(async () => {
      const result = await this.getClient().send(new QueryCommand(params));
      const items: string[] = [];
      const hasMorePages = result.LastEvaluatedKey !== undefined;
      result.Items?.forEach((item) => {
        items.push(sortKey);
      });
      return [items, hasMorePages];
    }, "Failed to get page of follows");
  }
}
