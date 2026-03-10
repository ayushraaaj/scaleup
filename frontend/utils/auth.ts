let accessToken: string | null = null;
let userRole: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

export const getAccessToken = () => {
    return accessToken;
};

export const setUserRole = (role: string) => {
    userRole = role;
};

export const getUserRole = () => {
    return userRole;
};
