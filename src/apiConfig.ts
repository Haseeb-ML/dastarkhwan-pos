// Centralized API configuration for local, cloud, and Firebase hosting
export const getApiBase = (): string => {
  if (typeof window !== "undefined") {
    // 1. Check if user configured a custom backend URL in localStorage
    const custom = localStorage.getItem("dastarkhwan_api_url");
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/$/, "");
    }

    // 2. If running on Firebase Hosting (.web.app or .firebaseapp.com)
    const hostname = window.location.hostname;
    if (hostname.endsWith(".web.app") || hostname.endsWith(".firebaseapp.com")) {
      return "https://dastarkhwan-pos.onrender.com";
    }
  }
  return "";
};

export const apiUrl = (path: string): string => {
  const base = getApiBase();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
};
