import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; // For interacting with S3 and uploading objects
import { ObjectCannedACL } from "@aws-sdk/client-s3"; // For specifying canned ACLs like "public-read"
import * as dotenv from "dotenv";
import { StorageDAO } from "./StorageDAO";
dotenv.config();
const BUCKET = process.env.BUCKET!;
const REGION = process.env.REGION!;

export class S3StorageDAO implements StorageDAO {
  public async putImage(
    fileName: string,
    imageStringBase64Encoded: string
  ): Promise<string> {
    let decodedImageBuffer: Buffer = Buffer.from(
      imageStringBase64Encoded,
      "base64"
    );
    const s3Params = {
      Bucket: BUCKET,
      Key: "image/" + fileName,
      Body: decodedImageBuffer,
      ContentType: "image/png",
      ACL: ObjectCannedACL.public_read,
    };
    const c = new PutObjectCommand(s3Params);
    const client = new S3Client({ region: REGION });
    try {
      await client.send(c);
      return `https://${BUCKET}.s3.${REGION}.amazonaws.com/image/${fileName}`;
    } catch (error) {
      throw Error("s3 put image failed with: " + error);
    }
  }
}
