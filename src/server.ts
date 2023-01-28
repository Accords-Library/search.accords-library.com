import http from "http";
import { webhookHandler } from "webhook";

export const requestListener: http.RequestListener = async (req, res) => {
  if (req.method !== "POST") {
    res
      .writeHead(405, { "Content-Type": "application/json" })
      .end(JSON.stringify({ message: "Method Not Allowed. Use POST." }));
    return;
  }

  if (req.url !== "/strapi/") {
    res
      .writeHead(404, { "Content-Type": "application/json" })
      .end(JSON.stringify({ message: "Route not found.", route: req.url }));
    return;
  }

  if (req.headers.authorization !== `Bearer ${process.env.WEBHOOK_TOKEN}`) {
    res
      .writeHead(403, { "Content-Type": "application/json" })
      .end(JSON.stringify({ message: "Invalid auth token." }));
    return;
  }

  // Retrieve and parse body
  const buffers: Uint8Array[] = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const data = JSON.parse(Buffer.concat(buffers).toString());

  await webhookHandler(data, res);

  res.writeHead(200, { "Content-Type": "application/json" }).end(
    JSON.stringify({
      message: "Done.",
    })
  );
};
