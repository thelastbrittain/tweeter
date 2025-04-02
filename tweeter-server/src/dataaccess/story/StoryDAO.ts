import { StatusDto } from "tweeter-shared";
import { Post } from "../Post";
export interface StoryDAO {
  getPageOfStoryItems(
    alias: string,
    pageSize: number,
    lastItem?: StatusDto
  ): Promise<[Post[], boolean]>;
  putStatus(status: StatusDto): Promise<void>;
}
