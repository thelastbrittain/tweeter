import { UserDto } from "tweeter-shared";
import { DynamoAuthDAO } from "../../src/dataaccess/auth/DynamoAuthDAO";

describe("UserTests", () => {
  const testToken: string = "abcd";
  const testAlias: string = "testAlias";
  const authDAO: DynamoAuthDAO = new DynamoAuthDAO();

  it("authSuccess ", async () => {
    await authDAO.putAuth(testAlias, testToken);
    let timestamp = await authDAO.getTimeStamp(testToken);
    console.log("--- Auth timestamp vs current time: ", timestamp, Date.now());
    expect(timestamp!).toBeLessThan(Date.now());
    await authDAO.updateTimeStamp(testToken);

    let newTimestamp = await authDAO.getTimeStamp(testToken);
    expect(newTimestamp).not.toBeNull;
    expect(timestamp).toBeLessThan(newTimestamp!);
  });
});
