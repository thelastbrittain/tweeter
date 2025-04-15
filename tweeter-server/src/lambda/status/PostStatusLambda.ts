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

  let message = JSON.stringify(request.status);
  console.log(`About to send message`);
  await sendMessage(
    "https://sqs.us-east-1.amazonaws.com/533267441690/SQS-Post-Status-Queue",
    message
  );

  console.log("Finished sending the message");

  return {
    success: true,
    message: null,
  };
};
