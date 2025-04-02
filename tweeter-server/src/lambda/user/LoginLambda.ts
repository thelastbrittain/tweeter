import { LoginResponse, TweeterRequest } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoUserDAO } from "../../dataaccess/user/DynamoUserDAO";
import { DynamoAuthDAO } from "../../dataaccess/auth/DynamoAuthDAO";
export const handler = async (
  request: TweeterRequest
): Promise<LoginResponse> => {
  const userService = new UserService(new DynamoUserDAO(), new DynamoAuthDAO());
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
