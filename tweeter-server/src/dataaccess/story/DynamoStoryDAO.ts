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
    console.log("Made it into getPageOfStoryItems");
    console.log(`These are the variables
      alias: ${alias}, pageSize: ${pageSize},
      lastItem: ${lastItem ? lastItem : "items not defined"}`);

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
      console.log("It think there is a lastItem, and it's making a start key");
      params.ExclusiveStartKey = {
        [this.ownerAliasAttribute]: alias,
        [this.timestampAttribute]: lastItem.timestamp,
      };
    }

    console.log("Finished making the querry. These are the params: ", params);

    return await this.tryRequest(async () => {
      const result = await this.getClient().send(new QueryCommand(params));
      console.log("In getPageOfStoryItems, request has been sent.");
      console.log(
        `This is result.Items ${
          result.Items ? JSON.stringify(result.Items) : "Items undefined"
        }`
      );
      const items: Post[] = [];
      const hasMorePages = result.LastEvaluatedKey !== undefined;
      console.log("THis is hasMorePages:", hasMorePages);
      result.Items?.forEach((item) => {
        console.log("Going through each returned item in getPageOfStoryItems");
        console.log(`ownerAlias: ${item[this.ownerAliasAttribute]},
          timestamp: ${item[this.timestampAttribute]},
          post: ${item[this.postAttribute]},`);
        items.push({
          ownerAlias: item[this.ownerAliasAttribute],
          timestamp: item[this.timestampAttribute],
          post: item[this.postAttribute],
        });
      });
      console.log(
        "Finishing the request in getPageOfStoryItems. This is items: ",
        items
      );
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
