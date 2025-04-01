export interface StorageDAO {
  putImage(fileName: string, imageStringBase64Encoded: string): Promise<string>;
}
