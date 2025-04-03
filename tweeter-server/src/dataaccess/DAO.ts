import { BadRequest } from "../Error/BadRequest";
import { ServerError } from "../Error/ServerError";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export abstract class DAO {
  private client: DynamoDBDocumentClient | undefined;

  protected getClient(): DynamoDBDocumentClient {
    if (!this.client) {
      this.client = DynamoDBDocumentClient.from(new DynamoDBClient());
    }
    return this.client;
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
          "Something went wrong in the server from data access layer",
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
