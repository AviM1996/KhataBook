import client from './client';

export async function login(email, password) {
  if (!email || !password) {
    throw new Error("EMAIL_PASSWORD_REQUIRED");
  }

  const data = await client('/auth/login', {
    body: { email, password }
  });

  // Save token in localStorage
  if (data.token) {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_info', JSON.stringify({
      _id: data._id,
      name: data.name,
      email: data.email
    }));
  }

  return { user: { uid: data._id, email: data.email, name: data.name }, token: data.token };
}

export async function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_info');
  window.location.replace("/login");
}
