import { TweeterResponse } from "./TweeterResponse";

export interface GetBothCountResponse extends TweeterResponse {
  readonly followerCount: number;
  readonly followeeCount: number;
}
