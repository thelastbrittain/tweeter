import { TweeterResponse } from "./TweeterResponse";

export interface GetIsFollowerResponse extends TweeterResponse {
  readonly isFollowing: boolean;
}
