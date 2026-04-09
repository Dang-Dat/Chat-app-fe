// d:\JS\Chat APP\frontend\src\lib\tokenStorage.ts

export const setToken = (token: string | null) => {
  if (token) {
    sessionStorage.setItem("accessToken", token);
  } else {
    sessionStorage.removeItem("accessToken");
  }
};

export const getToken = () => {
  return sessionStorage.getItem("accessToken");
};
