import { GetUserResponse, TweeterRequest, UserDto } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
export const handler = async (
  request: TweeterRequest
): Promise<GetUserResponse> => {
  const userService = new UserService();
  const userDto: UserDto | null = await userService.getUser(
    request.token,
    request.userAlias
  );

  return {
    success: true,
    message: null,
    user: userDto,
  };
};
