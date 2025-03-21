import { GetFollowerCountResponse, TweeterRequest } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";
export const handler = async (
  request: TweeterRequest
): Promise<GetFollowerCountResponse> => {
  const followService = new FollowService();
  const count = await followService.getFollowerCount(
    request.token,
    request.userAlias
  );
  return {
    success: true,
    message: null,
    count: count,
  };
};
