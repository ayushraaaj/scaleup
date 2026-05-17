interface User {
  _id: string;
  username: string;
  fullname: string;
  role: string;
}

let accessToken: string | null = null;
let user: User | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export const setUser = (u: User | null) => {
  user = u;
};

export const getUser = () => {
  return user;
};
