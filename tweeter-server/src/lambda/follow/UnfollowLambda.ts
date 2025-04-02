import { GetBothCountResponse, TweeterRequest } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoAuthDAO } from "../../dataaccess/auth/DynamoAuthDAO";
import { DynamoFollowDAO } from "../../dataaccess/follows/DynamoFollowDAO";
import { DynamoUserDAO } from "../../dataaccess/user/DynamoUserDAO";
export const handler = async (
  request: TweeterRequest
): Promise<GetBothCountResponse> => {
  const followService = new FollowService(
    new DynamoUserDAO(),
    new DynamoAuthDAO(),
    new DynamoFollowDAO()
  );
  const [followerCount, followeeCount] = await followService.unfollow(
    request.token,
    request.userAlias
  );
  return {
    success: true,
    message: null,
    followerCount: followerCount,
    followeeCount: followeeCount,
  };
};
