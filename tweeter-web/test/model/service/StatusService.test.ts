// // import { RegisterRequest } from "tweeter-shared";
// import "isomorphic-fetch";
// import { StatusService } from "../../../src/model/service/StatusService";
// import { AuthToken } from "tweeter-shared";
// import { isNullOrUndefined } from "util";
// import { assert } from "console";

// describe("StatusService", () => {
//   const tryTest = async (method: () => void) => {
//     try {
//       method();
//     } catch (error) {
//       console.log("Test failed: ", error);
//     }
//   };

//   it("loadMoreStoryItemsWorks ", async () => {
//     tryTest(async () => {
//       const statusService = new StatusService();
//       const testAuthToken = AuthToken.Generate();
//       const [statuses, hasMore] = await statusService.loadMoreStoryItems(
//         testAuthToken,
//         "testUserAlias",
//         2,
//         null
//       );
//       const firstStatus = statuses[0];
//       expect(firstStatus.user).not.toBeNull;
//     });
//   });
// });
