import { Status, User } from "tweeter-shared";
import { DynamoStoryDAO } from "../../src/dataaccess/story/DynamoStoryDAO";

describe("UserTests", () => {
  const testToken: string = "abcd";
  const testAlias: string = "testAlias";
  const storyDAO: DynamoStoryDAO = new DynamoStoryDAO();
  const fakeUser = new User("testFirst", "testLast", "testAlias", "testImage");

  it("Get story success ", async () => {
    let fakeStatus = new Status("A new post", fakeUser, Date.now());
    // post a status
    await storyDAO.putStatus(fakeStatus);
    // get all statuses
    const resultStatuses = await storyDAO.getPageOfStoryItems(
      fakeUser.alias,
      5
    );
    console.log(resultStatuses);
  });

  it("Many posts and get response ", async () => {
    // post a status
    let fakeStatus = new Status("A new post", fakeUser, Date.now());
    for (var i = 0; i < 5; i++) {
      let fakeStatus = new Status("A new post", fakeUser, Date.now());
      await storyDAO.putStatus(fakeStatus);
    }

    let middleStatus = new Status("middle status", fakeUser, Date.now());

    for (var i = 0; i < 5; i++) {
      let fakeStatus = new Status("A new post", fakeUser, Date.now());
      await storyDAO.putStatus(fakeStatus);
    }

    // get all statuses
    const resultStatuses = await storyDAO.getPageOfStoryItems(
      fakeUser.alias,
      5
    );

    console.log(`Here are the first statuses: ${resultStatuses}`);

    const moreResultStatuses = await storyDAO.getPageOfStoryItems(
      fakeUser.alias,
      2,
      middleStatus.dto
    );

    console.log(
      `Here are the next statuses: ${JSON.stringify(moreResultStatuses)}`
    );
  });
});
