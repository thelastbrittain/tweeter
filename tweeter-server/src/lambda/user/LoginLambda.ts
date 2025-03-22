import { LoginResponse, TweeterRequest } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
export const handler = async (
  request: TweeterRequest
): Promise<LoginResponse> => {
  const userService = new UserService();
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
