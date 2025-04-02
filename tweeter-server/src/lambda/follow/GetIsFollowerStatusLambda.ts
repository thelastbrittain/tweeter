import { GetIsFollowerRequest, GetIsFollowerResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
import { DynamoAuthDAO } from "../../dataaccess/auth/DynamoAuthDAO";
import { DynamoFollowDAO } from "../../dataaccess/follows/DynamoFollowDAO";
import { DynamoUserDAO } from "../../dataaccess/user/DynamoUserDAO";
export const handler = async (
  request: GetIsFollowerRequest
): Promise<GetIsFollowerResponse> => {
  const followService = new FollowService(
    new DynamoUserDAO(),
    new DynamoAuthDAO(),
    new DynamoFollowDAO()
  );
  const isFollower = await followService.getIsFollowerStatus(
    request.token,
    request.userAlias,
    request.selectedUserAlias
  );
  return {
    success: true,
    message: null,
    isFollowing: isFollower,
  };
};
