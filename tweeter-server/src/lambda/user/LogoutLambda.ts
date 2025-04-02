import { TweeterRequest, TweeterResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoUserDAO } from "../../dataaccess/user/DynamoUserDAO";
import { DynamoAuthDAO } from "../../dataaccess/auth/DynamoAuthDAO";
export const handler = async (
  request: TweeterRequest
): Promise<TweeterResponse> => {
  const userService = new UserService(new DynamoUserDAO(), new DynamoAuthDAO());
  await userService.logout(request.token);

  return {
    success: true,
    message: null,
  };
};
