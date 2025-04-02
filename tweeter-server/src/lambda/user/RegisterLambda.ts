import {
  LoginResponse,
  PostStatusRequest,
  RegisterRequest,
} from "tweeter-shared";
import { UserService } from "../../model/service/UserService";
import { DynamoUserDAO } from "../../dataaccess/user/DynamoUserDAO";
import { S3StorageDAO } from "../../dataaccess/storage/S3StorageDAO";
import { DynamoAuthDAO } from "../../dataaccess/auth/DynamoAuthDAO";
export const handler = async (
  request: RegisterRequest
): Promise<LoginResponse> => {
  const userService = new UserService(new DynamoUserDAO(), new DynamoAuthDAO());
  const [userDto, authDto] = await userService.register(
    request.firstName,
    request.lastName,
    request.userAlias,
    request.token,
    request.userImageBytes,
    request.imageFileExtension,
    new S3StorageDAO()
  );

  return {
    success: true,
    message: null,
    user: userDto,
    auth: authDto,
  };
};
