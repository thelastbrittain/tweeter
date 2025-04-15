import { AddToFeedRequest, StatusDto } from "tweeter-shared";
import { DynamoAuthDAO } from "../../dataaccess/auth/DynamoAuthDAO";
import { DynamoFollowDAO } from "../../dataaccess/follows/DynamoFollowDAO";
import { DynamoUserDAO } from "../../dataaccess/user/DynamoUserDAO";
import { FollowService } from "../../model/service/FollowService";
import sendMessage from "../sqs/SQSClient";

export const handler = async function (event: any) {
  const followService = new FollowService(
    new DynamoUserDAO(),
    new DynamoAuthDAO(),
    new DynamoFollowDAO()
  );

  for (let i = 0; i < event.Records.length; ++i) {
    const { body } = event.Records[i];
    // TODO: Add code to print message body to the log.
    // take the message from the queue, convert it to a statusDto
    console.log(body);
    let status: StatusDto = JSON.parse(body);

    // need to get followers and send them to the next lambda
    let hasMore = true;
    let lastAlias: string | null = null;
    while (hasMore) {
      let response = await followService.getFollowerAliases(
        status.user.alias,
        lastAlias
      );
      let followerAliases = response[0];
      hasMore = response[1];
      lastAlias = followerAliases[followerAliases.length - 1];
      let aliasesPostMessage: AddToFeedRequest = {
        status: status,
        userAliases: followerAliases,
      };
      await sendMessage("url", JSON.stringify(aliasesPostMessage));
    }
  }
  return null;
};
