import { TweeterRequest, TweeterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoUserDAO } from "../../dataaccess/user/DynamoUserDAO";
export const handler = async (
  request: TweeterRequest
): Promise<TweeterResponse> => {
  const userService = new UserService(new DynamoUserDAO());
  await userService.logout(request.token);

  return {
    success: true,
    message: null,
  };
};
