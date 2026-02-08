export default class LoginResult {
  public token?: string;
  public user?: User;
}

export interface User {
  id: number;
  email: string;
  password: string;
  registered_at: string;
  updated_at: string;
  openId: string;
  unionId: string;
  type: string;
  username: string;
  avatar: string;
}
