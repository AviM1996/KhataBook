const BASE_URL = '/api';

async function client(endpoint, { body, ...customConfig } = {}) {
  const token = localStorage.getItem('auth_token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  let data;
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (response.ok) {
    return data;
  } else {
    // Standardize error handling thrown to components
    const errorMessage = data?.message || typeof data === 'string' ? data : 'API Error';
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;

    // Handle 401 Unauthorized globally (e.g., token expired)
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      if (window.location.pathname !== '/login') {
         window.location.replace('/login');
      }
    }

    throw error;
  }
}

export default client;
