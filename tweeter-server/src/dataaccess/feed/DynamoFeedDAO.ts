import {
  BatchWriteCommand,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { DAO } from "../DAO";
import { Status, StatusDto } from "tweeter-shared";
import { Post } from "../Post";
import { FeedDAO } from "./FeedDAO";

export class DynamoFeedDAO extends DAO implements FeedDAO {
  readonly tableName = "tweeter-story";
  readonly followerAliasAttribute = "followerAlias";
  readonly timestampAttribute = "timestamp";
  readonly postAttribute = "post";

  public async getPageOfFeedItems(
    alias: string,
    pageSize: number,
    lastItem?: StatusDto
  ): Promise<[Post[], boolean]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "#partitionKey = :partitionValue",
      ExpressionAttributeNames: {
        "#partitionKey": this.followerAliasAttribute,
      },
      ExpressionAttributeValues: {
        ":partitionValue": alias,
      },
      Limit: pageSize,
    };
    if (lastItem) {
      params.ExclusiveStartKey = {
        [this.followerAliasAttribute]: alias,
        [this.timestampAttribute]: lastItem.timestamp,
      };
    }

    return await this.tryRequest(async () => {
      const result = await this.getClient().send(new QueryCommand(params));
      const items: Post[] = [];
      const hasMorePages = result.LastEvaluatedKey !== undefined;
      result.Items?.forEach((item) => {
        items.push({
          ownerAlias: item[this.followerAliasAttribute],
          timestamp: item[this.timestampAttribute],
          post: item[this.postAttribute],
        });
      });
      return [items, hasMorePages];
    }, "Failed to get page of follows");
  }

  public async uploadToFollowerFeeds(
    alias: string,
    followerAliases: string[],
    status: Status
  ): Promise<void> {
    if (followerAliases.length === 0) {
      return;
    }

    const batchSize = 25;
    const chunks: string[][] = [];

    for (let i = 0; i < followerAliases.length; i += batchSize) {
      chunks.push(followerAliases.slice(i, i + batchSize));
    }

    for (const chunk of chunks) {
      await this.tryRequest(async () => {
        const requests = chunk.map((followerAlias) => ({
          PutRequest: {
            Item: {
              [this.followerAliasAttribute]: followerAlias,
              [this.timestampAttribute]: status.timestamp,
              [this.postAttribute]: status.post,
            },
          },
        }));
        const params = {
          RequestItems: {
            [this.tableName]: requests,
          },
        };
        await this.getClient().send(new BatchWriteCommand(params));
      }, `Failed to upload status to follower feeds for alias ${alias}`);
    }
  }
}
