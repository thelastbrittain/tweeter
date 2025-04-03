import {
  BatchWriteCommand,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { DAO } from "../DAO";
import { Status, StatusDto } from "tweeter-shared";
import { Post } from "../Post";
import { FeedDAO } from "./FeedDAO";
import { BadRequest } from "../../Error/BadRequest";

export class DynamoFeedDAO extends DAO implements FeedDAO {
  readonly tableName = "tweeter-feed";
  readonly followerAliasAttribute = "followerAlias"; // partition key
  readonly timestampAttribute = "timestamp"; // sort key
  readonly postAttribute = "post";
  readonly ownerAliasAttribute = "ownerAlias";

  public async getPageOfFeedItems(
    alias: string,
    pageSize: number,
    lastItem?: StatusDto
  ): Promise<[Post[], boolean]> {
    console.log(
      `Starting getPageOfFeedItems for alias: ${alias}, pageSize: ${pageSize}, lastItem: ${
        lastItem ? JSON.stringify(lastItem) : "None"
      }`
    );

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
      console.log(
        "ExclusiveStartKey set for pagination:",
        params.ExclusiveStartKey
      );
    }

    return await this.tryRequest(async () => {
      console.log(
        "Sending QueryCommand with params:",
        JSON.stringify(params, null, 2)
      );
      const result = await this.getClient().send(new QueryCommand(params));

      const items: Post[] = [];
      const hasMorePages = result.LastEvaluatedKey !== undefined;

      if (result.Items) {
        console.log(`Query returned ${result.Items.length} items.`);
        result.Items.forEach((item) => {
          items.push({
            ownerAlias: item[this.ownerAliasAttribute],
            timestamp: item[this.timestampAttribute],
            post: item[this.postAttribute],
            followerAlias: item[this.followerAliasAttribute],
          });
        });
      } else {
        console.log("Query returned no items.");
      }

      console.log(
        `Returning ${items.length} items. Has more pages: ${hasMorePages}`
      );
      return [items, hasMorePages];
    }, "Failed to get page of follows");
  }

  public async uploadToFollowerFeeds(
    alias: string,
    followerAliases: string[],
    status: Status
  ): Promise<void> {
    console.log("Starting uploadToFollowerFeeds...");
    console.log("Alias:", alias);
    console.log("Number of follower aliases:", followerAliases.length);
    console.log("Status received:", status);

    if (followerAliases.length === 0) {
      console.warn("No follower aliases provided. Exiting function.");
      return;
    }

    if (!status.timestamp || typeof status.timestamp !== "number") {
      console.error(`Invalid timestamp: ${status.timestamp}`);
      throw new BadRequest(`Invalid timestamp: ${status.timestamp}`);
    }

    if (!status.post) {
      console.error(`Invalid post: ${status.post}`);
      throw new BadRequest(`Invalid post: ${status.post}`);
    }

    const batchSize = 25;
    const chunks: string[][] = [];

    console.log(
      `Splitting ${followerAliases.length} followers into chunks of size ${batchSize}...`
    );
    for (let i = 0; i < followerAliases.length; i += batchSize) {
      const chunk = followerAliases.slice(i, i + batchSize);
      chunks.push(chunk);
      console.log(`Created chunk with ${chunk.length} followers.`);
    }

    console.log(`Total chunks created: ${chunks.length}`);

    for (const [index, chunk] of chunks.entries()) {
      console.log(`Processing chunk ${index + 1} of ${chunks.length}...`);
      await this.tryRequest(async () => {
        const requests = chunk.map((followerAlias) => ({
          PutRequest: {
            Item: {
              [this.followerAliasAttribute]: followerAlias,
              [this.timestampAttribute]: status.timestamp,
              [this.postAttribute]: status.post,
              [this.ownerAliasAttribute]: alias,
            },
          },
        }));
        console.log(
          `Generated PutRequests for chunk ${index + 1}:`,
          JSON.stringify(requests, null, 2)
        );

        const params = {
          RequestItems: {
            [this.tableName]: requests,
          },
        };
        console.log(
          `BatchWriteCommand Params for chunk ${index + 1}:`,
          JSON.stringify(params, null, 2)
        );

        await this.getClient().send(new BatchWriteCommand(params));
        console.log(`Successfully processed chunk ${index + 1}.`);
      }, `Failed to upload status to follower feeds for alias ${alias}`);
    }

    console.log("uploadToFollowerFeeds completed successfully.");
  }
}
