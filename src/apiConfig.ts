// Centralized API configuration for local, cloud, and standalone execution
export const getApiBase = (): string => {
  if (typeof window !== "undefined") {
    // Check if user configured a custom backend URL in localStorage
    const custom = localStorage.getItem("dastarkhwan_api_url");
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/$/, "");
    }
  }
  return "";
};

export const apiUrl = (path: string): string => {
  const base = getApiBase();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
};
