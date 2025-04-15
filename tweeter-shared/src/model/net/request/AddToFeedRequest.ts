import { StatusDto } from "../../dto/StatusDto";

export interface AddToFeedRequest {
  status: StatusDto;
  userAliases: string[];
}
