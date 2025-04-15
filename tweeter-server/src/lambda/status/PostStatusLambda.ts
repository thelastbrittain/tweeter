import { PostStatusRequest, Status, TweeterResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { DynamoAuthDAO } from "../../dataaccess/auth/DynamoAuthDAO";
import { DynamoFeedDAO } from "../../dataaccess/feed/DynamoFeedDAO";
import { DynamoFollowDAO } from "../../dataaccess/follows/DynamoFollowDAO";
import { DynamoStoryDAO } from "../../dataaccess/story/DynamoStoryDAO";
import { DynamoUserDAO } from "../../dataaccess/user/DynamoUserDAO";
import sendMessage from "../sqs/SQSClient";
export const handler = async (
  request: PostStatusRequest
): Promise<TweeterResponse> => {
  const statusService = new StatusService(
    new DynamoUserDAO(),
    new DynamoAuthDAO(),
    new DynamoStoryDAO(),
    new DynamoFeedDAO(),
    new DynamoFollowDAO()
  );
  await statusService.postStatusToStory(
    request.token,
    Status.fromDto(request.status)!
  );

  // put message into sqs
  await sendMessage("some_url", JSON.stringify(request.status));

  return {
    success: true,
    message: null,
  };
};
