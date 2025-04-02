import { GetUserResponse, TweeterRequest, UserDto } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoUserDAO } from "../../dataaccess/user/DynamoUserDAO";
import { DynamoAuthDAO } from "../../dataaccess/auth/DynamoAuthDAO";
export const handler = async (
  request: TweeterRequest
): Promise<GetUserResponse> => {
  const userService = new UserService(new DynamoUserDAO(), new DynamoAuthDAO());
  const userDto: UserDto | null = await userService.getUser(
    request.token,
    request.userAlias
  );
  if (userDto) {
  }
  return {
    success: true,
    message: null,
    user: userDto!,
  };
};
