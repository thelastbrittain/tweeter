import {
  PutCommand,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { DAO } from "../DAO";
import { StoryDAO } from "./StoryDAO";
import { StatusDto } from "tweeter-shared";
import { Post } from "../Post";

export class DynamoStoryDAO extends DAO implements StoryDAO {
  readonly tableName = "tweeter-story";
  readonly ownerAliasAttribute = "ownerAlias";
  readonly timestampAttribute = "timestamp";
  readonly postAttribute = "post";

  public async getPageOfStoryItems(
    alias: string,
    pageSize: number,
    lastItem?: StatusDto
  ): Promise<[Post[], boolean]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "#partitionKey = :partitionValue",
      ExpressionAttributeNames: {
        "#partitionKey": this.ownerAliasAttribute,
      },
      ExpressionAttributeValues: {
        ":partitionValue": alias,
      },
      Limit: pageSize,
    };
    if (lastItem) {
      params.ExclusiveStartKey = {
        [this.ownerAliasAttribute]: alias,
        [this.timestampAttribute]: lastItem.timestamp,
      };
    }

    return await this.tryRequest(async () => {
      const result = await this.getClient().send(new QueryCommand(params));
      const items: Post[] = [];
      const hasMorePages = result.LastEvaluatedKey !== undefined;
      result.Items?.forEach((item) => {
        items.push({
          ownerAlias: item[this.ownerAliasAttribute],
          timestamp: item[this.timestampAttribute],
          post: item[this.postAttribute],
        });
      });
      return [items, hasMorePages];
    }, "Failed to get page of follows");
  }

  public async putStatus(status: StatusDto): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        [this.ownerAliasAttribute]: status.user.alias,
        [this.timestampAttribute]: status.timestamp,
        [this.postAttribute]: status.post,
      },
    };
    await this.tryRequest(async () => {
      await this.getClient().send(new PutCommand(params));
      return;
    }, "Failed to put status");
  }
}
