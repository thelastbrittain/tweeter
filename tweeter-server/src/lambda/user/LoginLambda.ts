import { LoginResponse, TweeterRequest } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoUserDAO } from "../../dataaccess/user/DynamoUserDAO";
export const handler = async (
  request: TweeterRequest
): Promise<LoginResponse> => {
  const userService = new UserService(new DynamoUserDAO());
  const [userDto, authDto] = await userService.login(
    request.userAlias,
    request.token
  );

  return {
    success: true,
    message: null,
    user: userDto,
    auth: authDto,
  };
};
