import {
  LoginResponse,
  PostStatusRequest,
  RegisterRequest,
} from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
export const handler = async (
  request: RegisterRequest
): Promise<LoginResponse> => {
  const userService = new UserService();
  const [userDto, authDto] = await userService.register(
    request.firstName,
    request.lastName,
    request.userAlias,
    request.token,
    request.userImageBytes,
    request.imageFileExtension
  );

  return {
    success: true,
    message: null,
    user: userDto,
    auth: authDto,
  };
};
