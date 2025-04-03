import {
  LoadMoreItemsRequest,
  LoadMoreItemsResponse,
  Status,
} from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
import { DynamoAuthDAO } from "../../dataaccess/auth/DynamoAuthDAO";
import { DynamoFeedDAO } from "../../dataaccess/feed/DynamoFeedDAO";
import { DynamoFollowDAO } from "../../dataaccess/follows/DynamoFollowDAO";
import { DynamoStoryDAO } from "../../dataaccess/story/DynamoStoryDAO";
import { DynamoUserDAO } from "../../dataaccess/user/DynamoUserDAO";
export const handler = async (
  request: LoadMoreItemsRequest
): Promise<LoadMoreItemsResponse> => {
  const statusService = new StatusService(
    new DynamoUserDAO(),
    new DynamoAuthDAO(),
    new DynamoStoryDAO(),
    new DynamoFeedDAO(),
    new DynamoFollowDAO()
  );
  const [statuses, hasMorePages] = await statusService.loadMoreStoryItems(
    request.token,
    request.userAlias,
    request.pageSize,
    Status.fromDto(request.lastItem)
  );

  return {
    success: true,
    message: null,
    statuses: statuses,
    hasMorePages: hasMorePages,
  };
};
