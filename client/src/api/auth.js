import client from './client';

export async function login(email, password) {
  try {
    if (!email || !password) {
      throw new Error("Email and Password are required");
    }

    const data = await client('auth/login', {
      body: { email, password }
    })

    return {
      user: data?.user ?? null,
      isAuthenticated: true,
    };

  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
}

export async function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_info');
  window.location.replace("/login");
}
