import { TweeterRequest } from "./TweeterRequest";

export interface GetIsFollowerRequest extends TweeterRequest {
  readonly selectedUserAlias: string;
}
