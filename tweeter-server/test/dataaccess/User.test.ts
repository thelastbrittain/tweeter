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

  it("changeQuantityFollowersSuccess ", async () => {
    const userDAO = new DynamoUserDAO();

    let startFollowerCount = await userDAO.getNumFollowers(testUser.alias);
    console.log("--- Start Follower count: ", startFollowerCount);

    await userDAO.incrementNumFollowers(testUser.alias);

    let addedFollowerCount = await userDAO.getNumFollowers(testUser.alias);
    console.log("-- Follower count after adding 1: ", addedFollowerCount);

    expect(startFollowerCount).toEqual(addedFollowerCount - 1);

    await userDAO.decrementNumFollowers(testUser.alias);
    let subtractedFollowerCount = await userDAO.getNumFollowers(testUser.alias);
    console.log(
      "------ Follower count after subtracting 1: ",
      subtractedFollowerCount
    );
    expect(subtractedFollowerCount).toEqual(startFollowerCount);
  });

  it("changeQuantityFolloweesSuccess ", async () => {
    const userDAO = new DynamoUserDAO();

    let startFolloweeCount = await userDAO.getNumFollowees(testUser.alias);
    console.log("--- Start Followee count: ", startFolloweeCount);

    await userDAO.incrementNumFollowees(testUser.alias);

    let addedFolloweeCount = await userDAO.getNumFollowees(testUser.alias);
    console.log("-- Followee count after adding 1: ", addedFolloweeCount);

    expect(startFolloweeCount).toEqual(addedFolloweeCount - 1);

    await userDAO.decrementNumFollowees(testUser.alias);
    let subtractedFolloweeCount = await userDAO.getNumFollowees(testUser.alias);
    console.log(
      "------ Followee count after subtracting 1: ",
      subtractedFolloweeCount
    );
    expect(subtractedFolloweeCount).toEqual(startFolloweeCount);
  });

  it("Check get alias and password ", async () => {
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

    let aliasExists = await userDAO.aliasExists(testUser.alias);
    expect(aliasExists).toBeTruthy();
    console.log(
      "---- Here is the alias checker. It should be true: ",
      aliasExists
    );
    let aliasDoesntExist = await userDAO.aliasExists("False Alias");
    expect(aliasDoesntExist).toBeFalsy();
    let result = await userDAO.getAliasAndPassword(testUser.alias);
    expect(result).not.toBeNull();
    console.log("---- Here is the result for getting alias and pass: ", result);
    const { alias, password } = result!;
    expect(alias).toBe(testUser.alias);
    expect(password).toBe(testPassword);
  });
});
