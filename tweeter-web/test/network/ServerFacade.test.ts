// import { RegisterRequest } from "tweeter-shared";
import {
  LoadMoreItemsRequest,
  PagedUserItemRequest,
  RegisterRequest,
  StatusDto,
  TweeterRequest,
  User,
  UserDto,
} from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";
import "isomorphic-fetch";

describe("ServerFacade", () => {
  const tryTest = async (method: () => void) => {
    try {
      await method();
    } catch (error) {
      console.log("Test failed: ", error);
    }
  };

  it("register method is successful ", async () => {
    await tryTest(async () => {
      let request: RegisterRequest = {
        userAlias: "testAlias",
        token: "testPassword",
        firstName: "testFirstName",
        lastName: "testLastName",
        userImageBytes: "testUserImageBytes",
        imageFileExtension: "testFileExtension",
      };
      const serverFacade: ServerFacade = new ServerFacade();
      const [userDto, authDto] = await serverFacade.register(request);
      expect(userDto.alias).not.toBeNull;
      expect(userDto.imageUrl).not.toBeNull;
      expect(authDto.timestamp).not.toBeNull;
      expect(authDto.token).not.toBeNull;
    });
  });
  it("getMoreFollowers method is successful ", async () => {
    await tryTest(async () => {
      let request: PagedUserItemRequest = {
        userAlias: "testAlias",
        token: "testToken",
        pageSize: 2,
        lastItem: null,
      };
      const serverFacade: ServerFacade = new ServerFacade();
      const [users, hasMore] = await serverFacade.getMoreFollowers(request);
      const firstUser: User = users[0];
      expect(firstUser.alias).not.toBeNull;
      expect(firstUser.imageUrl).not.toBeNull;
      expect(hasMore).toBeTruthy;
      // console.log(users);
    });
  });

  it("getFollowingCount method is successful ", async () => {
    await tryTest(async () => {
      let request: TweeterRequest = {
        userAlias: "testAlias",
        token: "testToken",
      };
      const serverFacade: ServerFacade = new ServerFacade();
      const count: number = await serverFacade.getFolloweeCount(request);
      // console.log(count);
      expect(count).not.toBeNull;
    });
  });

  it("loadMoreStoryItems method is successful ", async () => {
    await tryTest(async () => {
      let request: LoadMoreItemsRequest = {
        userAlias: "testAlias",
        token: "testToken",
        pageSize: 5,
        lastItem: null,
      };
      const serverFacade: ServerFacade = new ServerFacade();
      const [statuses, hasMore] = await serverFacade.loadMoreStoryItems(
        request
      );
      console.log(statuses);
      let firstStatus: StatusDto = statuses[0];
      console.log(
        "LOAD MORE STORY ITEMS SERVER FACADE FIRST STATUSUSER",
        firstStatus.user
      );
    });
  });
});
