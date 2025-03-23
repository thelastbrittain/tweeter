// import { RegisterRequest } from "tweeter-shared";
import "isomorphic-fetch";
import { StatusService } from "../../../src/model/service/StatusService";
import { FollowService } from "../../../src/model/service/FollowService";
import { AuthToken } from "tweeter-shared";

describe("FollowService", () => {
  const tryTest = async (method: () => void) => {
    try {
      await method();
    } catch (error) {
      console.log("Test failed: ", error);
    }
  };

  it("loadMoreStoryItemsWorks ", async () => {
    // tryTest(async () => {

    // });
    const statusService = new StatusService();
    const testAuthToken = AuthToken.Generate();
    const [statuses, hasMore] = await statusService.loadMoreStoryItems(
      testAuthToken,
      "testUserAlias",
      2,
      null
    );
    expect(statuses.length).toBe(2);
    const firstStatus = statuses[0];
    expect(firstStatus.user).not.toBeNull;
    expect(firstStatus.user.imageUrl).not.toBeNull;
    console.log("THIS IS THE IMAGE URL:", firstStatus.user.imageUrl);
    console.log("THIS IS THE user:", firstStatus.user);
  });

  it("loadMoreFollowees Works ", async () => {
    // tryTest(async () => {

    // });
    const followService = new FollowService();
    const testAuthToken = AuthToken.Generate();
    const [users, hasMore] = await followService.loadMoreFollowees(
      testAuthToken,
      "testUserAlias",
      2,
      null
    );
    console.log("STATUS SERVICE LOAD MORE FOLLOWEES", users);
  });
});
