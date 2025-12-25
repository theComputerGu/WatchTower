const API_URL = "http://localhost:5185/api/auth";

export async function register(data: {email: string;password: string;username: string;}) {
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

  //token
  return res.json();
}




export async function login(data: {email: string;password: string;}) {
  const res = await fetch("http://localhost:5185/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
  let message = "Login failed";

  if (res.status === 401) {
    message = "Invalid email or password";
  } else if (res.status === 400) {
    message = "Invalid request";
  }

  throw new Error(message);
}

  //token:
  return res.json();
}

