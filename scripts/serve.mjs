import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const server = http.createServer((request, response) => {
  const requestPath = request.url === "/" ? "/dashboard/" : request.url;
  const relative = requestPath.endsWith("/") ? `${requestPath}index.html` : requestPath;
  const filePath = path.normalize(path.join(root, relative));
  if (!filePath.startsWith(root)) { response.writeHead(403); response.end("Forbidden"); return; }
  fs.readFile(filePath, (error, data) => {
    if (error) { response.writeHead(404); response.end("Not found"); return; }
    const type = filePath.endsWith(".html") ? "text/html" : filePath.endsWith(".js") ? "text/javascript" : filePath.endsWith(".css") ? "text/css" : "application/json";
    response.writeHead(200, { "Content-Type": type }); response.end(data);
  });
});
server.listen(4173, () => console.log("Resume Story Engine dashboard: http://localhost:4173/dashboard/"));
