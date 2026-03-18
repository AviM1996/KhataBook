const BASE_URL = 'http://localhost:8080/api/v1/';

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

async function refreshToken() {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error("Refresh token failed");
  }
}

async function client(endpoint, { body, headers: customHeaders, ...customConfig } = {}) {
  const config = {
    method: body ? 'POST' : 'GET',
    credentials: 'include',
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401 && !endpoint.includes('/auth/refresh')) {

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        await refreshToken();
        isRefreshing = false;
        onRefreshed(); 

      } catch (err) {
        isRefreshing = false;
        window.location.replace("/login");
        throw err;
      }
    }

    return new Promise((resolve, reject) => {
      subscribeTokenRefresh(async () => {
        try {
          const retryRes = await fetch(`${BASE_URL}${endpoint}`, config);

          const contentType = retryRes.headers.get('content-type');
          const data = contentType?.includes('application/json')? await retryRes.json(): await retryRes.text();

          if (retryRes.ok) {
            resolve(data);
          } else {
            reject(new Error(data?.message || "Retry failed"));
          }

        } catch (err) {
          reject(err);
        }
      });
    });
  }

  const contentType = response.headers.get('content-type');

  const data = contentType?.includes('application/json')? await response.json(): await response.text();

  if (!response.ok) {
    throw new Error(data?.message || "API Error");
  }

  return data;
}

export default client;