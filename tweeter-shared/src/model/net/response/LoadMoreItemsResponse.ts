import { StatusDto } from "../../dto/StatusDto";
import { TweeterResponse } from "./TweeterResponse";

export interface LoadMoreItemsResponse extends TweeterResponse {
  statuses: StatusDto[];
  hasMorePages: boolean;
}
