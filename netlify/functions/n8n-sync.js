exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const authPassword = process.env.N8N_AUTH_PASSWORD;

  if (!webhookUrl || !authPassword) {
    console.error("Missing N8N_WEBHOOK_URL or N8N_AUTH_PASSWORD environment variables");
    return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error" }) };
  }

  try {
    const formData = JSON.parse(event.body);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + Buffer.from("n8n:" + authPassword).toString("base64"),
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      console.error("n8n webhook responded with status:", response.status);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "n8n webhook error" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Error sending data to n8n:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
