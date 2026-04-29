export function getApiBaseUrl() {
  
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL.replace(/\/+$/, "");
  }

  return "http://127.0.0.1:8000";
}