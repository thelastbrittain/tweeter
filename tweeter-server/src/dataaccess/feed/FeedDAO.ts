import { Status, StatusDto } from "tweeter-shared";
import { Post } from "../Post";

export interface FeedDAO {
  getPageOfFeedItems(
    alias: string,
    pageSize: number,
    lastItem?: StatusDto
  ): Promise<[Post[], boolean]>;
  uploadToFollowerFeeds(
    alias: string,
    followerAliases: string[],
    status: Status
  ): Promise<void>;
}
