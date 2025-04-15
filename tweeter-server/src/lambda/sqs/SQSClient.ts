import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { ServerError } from "../../Error/ServerError";

let sqsClient = new SQSClient();

export default async function sendMessage(
  url: string,
  message: string
): Promise<void> {
  const params = {
    DelaySeconds: 0,
    MessageBody: message,
    QueueUrl: url,
  };

  console.log(`Sending a message with params: ${params}`);

  try {
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log("Success, message sent. MessageID:", data.MessageId);
  } catch (err) {
    throw new ServerError(`Failed to put message: ${message}, with url: ${url}. 
        Caught: ${err}`);
  }
}
