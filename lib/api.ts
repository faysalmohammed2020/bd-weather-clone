// Get Logs
export const getLogs = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/logs`, {
    next: {
      tags: ["logs"],
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch logs");
  }

  return response.json();
};
