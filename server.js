// server.js
import { join } from "path";
import { existsSync } from "fs";
import { parse } from "url";
import next from "next";
import { createServer } from "http";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

// Check if .next/standalone directory exists (production build)
const useStandalone =
  !dev && existsSync(join(process.cwd(), ".next/standalone"));

// Use standalone server in production, or regular Next.js dev server in development
const app = next({
  dev,
  dir: useStandalone ? join(process.cwd(), ".next/standalone") : process.cwd(),
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
