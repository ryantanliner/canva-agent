import { auth } from "@canva/user";

export async function makeAPIRequest(endpoint: string, data: any) {
  const token = await auth.getCanvaUserToken();

  const response = await fetch(`${BACKEND_HOST}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Backend responded with status: ${response.status}`);
  }

  return response.json();
} 