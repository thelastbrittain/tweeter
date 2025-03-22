import { PostStatusRequest, Status, TweeterResponse } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
export const handler = async (
  request: PostStatusRequest
): Promise<TweeterResponse> => {
  const statusService = new StatusService();
  await statusService.postStatus(
    request.token,
    Status.fromDto(request.status)!
  );

  return {
    success: true,
    message: null,
  };
};
