#!/usr/bin/env node
import http from "http";
import { URL } from "url";

// Simple proxy for Data.go.kr RiseSetInfoService
// Usage: SERVICE_KEY=yourKey node scripts/proxy.mjs

const SERVICE_KEY =
  process.env.SERVICE_KEY ||
  "uE2Fljsvf2rPBpiUGBrvnx9BD8hRYKp18YS3GeagdnuhTgCE3DggKvsj46Wtk4D6dOXlsZzcKpCtrzojcFwEnQ==";
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname !== "/api/riseset") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    const location = url.searchParams.get("location") || "";
    const locdate = url.searchParams.get("locdate") || "";

    const target = new URL(
      "http://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getAreaRiseSetInfo"
    );
    target.searchParams.set("location", location);
    target.searchParams.set("locdate", locdate);
    target.searchParams.set("ServiceKey", SERVICE_KEY);

    const fetchRes = await fetch(target.toString());
    const text = await fetchRes.text();

    // Return XML/text and allow CORS for local testing
    res.writeHead(200, {
      "Content-Type":
        fetchRes.headers.get("content-type") ||
        "application/xml; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(text);
  } catch (e) {
    console.error(e);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("proxy error");
  }
});

server.listen(PORT, () => {
  console.log(
    `RiseSet proxy listening on http://localhost:${PORT}/api/riseset`
  );
});
