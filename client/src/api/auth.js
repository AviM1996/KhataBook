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
  try {
    await client('auth/logout', { method: 'POST' });
    window.location.replace("/login");
  } catch (error) {
    console.error("Logout failed", error);
    window.location.replace("/login");
  }
}

export async function getCurrentUser() {
  try {
    const data = await client('auth/me');
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch user");
  }
}
