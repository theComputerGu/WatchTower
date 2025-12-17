const API_URL = "http://localhost:5185/api/auth";

export async function register(data: {
  email: string;
  password: string;
  username: string;
}) {
  const res = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.json(); // { token, user }
}




export async function login(data: {
  email: string;
  password: string;
}) {
  const res = await fetch("http://localhost:5185/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.json(); // { token, user }
}

