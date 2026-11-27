import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);

const listRunDocs = (dir, slug) => {
  const docs = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (ext !== ".md" && ext !== ".html") continue;
    docs.push({
      name: entry.name,
      kind: ext === ".html" ? "html" : "md",
      url: `/data/private/${slug}/${encodeURIComponent(entry.name)}`
    });
  }
  docs.sort((a, b) => a.name.localeCompare(b.name));
  return docs;
};

const listRuns = () => {
  const runs = [];
  const privateDir = path.join(root, "data", "private");
  if (fs.existsSync(privateDir)) {
    for (const entry of fs.readdirSync(privateDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const runFolder = path.join(privateDir, entry.name);
      const prepFile = path.join(runFolder, "06-preparation.json");
      if (fs.existsSync(prepFile)) {
        const stat = fs.statSync(prepFile);
        runs.push({
          id: entry.name,
          label: `${entry.name} (private)`,
          url: `/data/private/${entry.name}/06-preparation.json`,
          docs: listRunDocs(runFolder, entry.name),
          mtimeMs: stat.mtimeMs
        });
      }
    }
  }
  runs.sort((a, b) => b.mtimeMs - a.mtimeMs);
  runs.push({
    id: "instrumental-demo",
    label: "instrumental-demo (demo)",
    url: "/data/instrumental-demo.json",
    docs: [],
    mtimeMs: 0
  });
  return runs;
};

const server = http.createServer((request, response) => {
  const parsed = new URL(request.url || "/", `http://localhost:${port}`);
  if (parsed.pathname === "/api/runs") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ runs: listRuns() }));
    return;
  }
  const requestPath = parsed.pathname === "/" ? "/dashboard/" : decodeURIComponent(parsed.pathname);
  const relative = requestPath.endsWith("/") ? `${requestPath}index.html` : requestPath;
  const filePath = path.normalize(path.join(root, relative));
  if (!filePath.startsWith(root)) { response.writeHead(403); response.end("Forbidden"); return; }
  fs.readFile(filePath, (error, data) => {
    if (error) { response.writeHead(404); response.end("Not found"); return; }
    const type = filePath.endsWith(".html")
      ? "text/html; charset=utf-8"
      : filePath.endsWith(".js")
        ? "text/javascript; charset=utf-8"
        : filePath.endsWith(".css")
          ? "text/css; charset=utf-8"
          : filePath.endsWith(".md")
            ? "text/markdown; charset=utf-8"
            : "application/json; charset=utf-8";
    response.writeHead(200, { "Content-Type": type });
    response.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  const runs = listRuns();
  console.log(`Resume Story Engine dashboard: http://localhost:${port}/dashboard/`);
  if (runs[0] && runs[0].id !== "instrumental-demo") {
    console.log(`Latest preparation (${runs[0].id}): http://localhost:${port}/dashboard/?run=${runs[0].id}`);
  }
});
