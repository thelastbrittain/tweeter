import { AuthDto } from "../../dto/AuthDto";
import { UserDto } from "../../dto/UserDto";
import { TweeterResponse } from "./TweeterResponse";

export interface LoginResponse extends TweeterResponse {
  readonly user: UserDto;
  readonly auth: AuthDto;
}
