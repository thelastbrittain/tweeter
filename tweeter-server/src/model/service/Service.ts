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

  protected acceptableTimeFrame(timestamp: number): boolean {
    let oneMinuteAgo = Date.now() - 60000;
    if (timestamp < oneMinuteAgo) {
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
      if (error! instanceof BadRequest) {
        throw new ServerError("");
      }
      throw error;
    }
  }
}
