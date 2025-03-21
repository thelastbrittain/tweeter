import { StatusDto } from "../../dto/StatusDto";
import { TweeterRequest } from "./TweeterRequest";

export interface LoadMoreItemsRequest extends TweeterRequest {
  readonly pageSize: number;
  readonly lastItem: StatusDto | null;
}
