export interface AuthDAO {
  putAuth(alias: string, token: string): Promise<void>;
  getTimeStamp(token: string): Promise<number | null>;
  updateTimeStamp(token: string): Promise<void>;
  deleteAuth(token: string): Promise<void>;
  getAlias(token: string): Promise<string | null>;
}
