import { AddToFeedRequest, Status, StatusDto } from "tweeter-shared";
import { DynamoAuthDAO } from "../../dataaccess/auth/DynamoAuthDAO";
import { DynamoFollowDAO } from "../../dataaccess/follows/DynamoFollowDAO";
import { DynamoUserDAO } from "../../dataaccess/user/DynamoUserDAO";
import { DynamoFeedDAO } from "../../dataaccess/feed/DynamoFeedDAO";
import { DynamoStoryDAO } from "../../dataaccess/story/DynamoStoryDAO";
import { StatusService } from "../../model/service/StatusService";

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export const handler = async function (event: any) {
  const statusService = new StatusService(
    new DynamoUserDAO(),
    new DynamoAuthDAO(),
    new DynamoStoryDAO(),
    new DynamoFeedDAO(),
    new DynamoFollowDAO()
  );

  for (let i = 0; i < event.Records.length; ++i) {
    const { body } = event.Records[i];
    console.log(body);
    const startTimeMillis = new Date().getTime();

    const request: AddToFeedRequest = JSON.parse(body);
    const followerAliases: string[] = request.userAliases;
    const status: StatusDto = request.status;

    const batchSize = 25;
    const batches = chunk(followerAliases, batchSize);
    for (const batch of batches) {
      console.log(`current batch processing: ${batch}`);
      await statusService.postStatusToFeed(Status.fromDto(status)!, batch);
    }

    let requiredTime = 2000; // 2 seconds
    const elapsedTime = new Date().getTime() - startTimeMillis;
    if (elapsedTime < requiredTime) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, requiredTime - elapsedTime)
      );
    }
  }
  return null;
};
