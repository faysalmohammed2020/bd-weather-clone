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

// Get Time information
export const getTimeInformation = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/time-check`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        tags: ["time-check"],
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch time information");
  }

  return response.json();
};
