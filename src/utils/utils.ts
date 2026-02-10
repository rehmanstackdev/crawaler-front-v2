export const getToken = (parsed: boolean = false): string | object | null => {
  const hostTokenKey = "access_token";
  const token = localStorage.getItem(hostTokenKey);
  return parsed ? (token ? JSON.parse(token) : {}) : token;
};

export const setToken = (tokenData: string): void => {
  localStorage.setItem("access_token", tokenData);
};

export const setSystemUserToken = (tokenData: string): void => {
  localStorage.setItem("system_user_access_token", tokenData);
};

export const getSystemUserToken = (parsed: boolean = false): string | object | null => {
  const systemTokenKey = "system_user_access_token";
  const token = localStorage.getItem(systemTokenKey);
  return parsed ? (token ? JSON.parse(token) : {}) : token;
};
export const removeToken = (): void => {
  localStorage.removeItem("access_token");
  sessionStorage.removeItem("userTemplates");
};

export const parseJwt = (token: any): Record<string, unknown> => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid JWT token", error);
    return {};
  }
};

export const getAuthHeader = (): Record<string, string> => {

    
    const user: { access_token?: string } | null = getToken(true) as {
      access_token?: string;
    } | null;

    return user && user?.access_token
      ? { Authorization: `Bearer ${user.access_token}` }
      : {};
  }

export const getCurrentUserDetails = (): any => {
  const isSystemUser = localStorage.getItem("is_system_user") === "true";
  
  if (isSystemUser) {
    const systemUserData = getSystemUserToken(true) as any;
    return systemUserData || null;
  } else {
    const userData = getToken(true) as any;
    return userData || null;
  }
};
