import {
  LoadMoreItemsRequest,
  LoadMoreItemsResponse,
  Status,
} from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";
export const handler = async (
  request: LoadMoreItemsRequest
): Promise<LoadMoreItemsResponse> => {
  const statusService = new StatusService();
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
