import { assertRimrafOptions } from "rimraf";
import { DynamoUserDAO } from "../../src/dataaccess/user/DynamoUserDAO";
import { UserDto } from "tweeter-shared";

describe("UserTests", () => {
  let testUser: UserDto = {
    alias: "this should be alias",
    firstName: "ben",
    lastName: "brittain",
    imageUrl: "thelast.click",
  };
  let testPassword = "test pass";
  it("registerSuccess ", async () => {
    const userDAO = new DynamoUserDAO();
    await userDAO.putUser(
      testUser.firstName,
      testUser.lastName,
      testUser.alias,
      testPassword,
      testUser.imageUrl
    );

    let user: UserDto | null = await userDAO.getUser(testUser.alias);
    console.log("-----This is the user: ", user);
    expect(user).toEqual(testUser);
    // expect(true).toBeTruthy();
  });

  it("incrementFollowersSuccess ", async () => {
    const userDAO = new DynamoUserDAO();

    let startFollowerCount = await userDAO.getNumFollowers(testUser.alias);
    console.log("--- Start Follow count ", startFollowerCount);

    await userDAO.incrementNumFollowers(testUser.alias);

    let updatedFollowerCount = await userDAO.getNumFollowers(testUser.alias);
    console.log("--- End Follow count ", updatedFollowerCount);

    expect(startFollowerCount).toEqual(updatedFollowerCount - 1);
  });
});
