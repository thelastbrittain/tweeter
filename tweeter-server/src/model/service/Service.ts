import { AuthDAO } from "../../dataaccess/auth/AuthDAO";
import { UserDAO } from "../../dataaccess/user/UserDAO";
import { BadRequest } from "../../Error/BadRequest";
import { ServerError } from "../../Error/ServerError";

export abstract class Service {
  protected userDAO: UserDAO;
  protected authDAO: AuthDAO;

  public constructor(userDAO: UserDAO, authDAO: AuthDAO) {
    this.userDAO = userDAO;
    this.authDAO = authDAO;
  }

  // if auth is not expired, update timestamp, true
  // if auth expired, delete it, return false
  protected async verifyAuth(token: string): Promise<void> {
    await this.tryRequest(async () => {
      const oldTimestamp = await this.authDAO.getTimeStamp(token);
      if (!oldTimestamp) {
        console.error("In isVerifiedAuth, token does not exist");
        throw new BadRequest("token does not exist");
      } else if (!this.acceptableTimeFrame(oldTimestamp)) {
        await this.authDAO.deleteAuth(token);
        console.error("In isVerifiedAuth, token time limit expired");
        throw new BadRequest("Due to inactivity, the user must relogin");
      } else {
        await this.authDAO.updateTimeStamp(token);
      }
    }, "Failed to verify auth");
  }

  protected acceptableTimeFrame(timestamp: number): boolean {
    let twoMinutesAgo = Date.now() - 120000;
    if (timestamp < twoMinutesAgo) {
      return false;
    }
    return true;
  }

  protected async tryRequest<R>(
    method: () => Promise<R>,
    errorMessage: string
  ): Promise<R> {
    try {
      return await method();
    } catch (error) {
      console.error(errorMessage + error);
      if (error instanceof BadRequest) {
        throw error;
      } else if (error instanceof ServerError) {
        throw new ServerError(
          "Something went wrong in the server",
          error.message
        );
      } else if (error instanceof Error) {
        throw new ServerError(
          "Unexpected error in the server: ",
          error.message
        );
      } else {
        throw new ServerError(
          "Something unexpected in the server happened",
          JSON.stringify(error)
        );
      }
    }
  }
}
