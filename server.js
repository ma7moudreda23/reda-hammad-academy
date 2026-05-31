// Custom Next.js server for Hostinger (Phusion Passenger / CloudLinux Node.js).
//
// Hostinger's managed Node runtime starts the app through Passenger, which
// loads THIS file directly instead of running `next start`. Passenger
// intercepts `.listen()` and binds the app to its own socket, so the port
// number passed below is only used as a fallback for plain Node hosting.
//
// NOTE: keep this file plain CommonJS — it is NOT processed by the Next.js
// compiler, so it must be valid for the Node version configured on the host.

const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "0.0.0.0";

// dev:false → serve the production build in .next (created by `next build`).
const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, () => {
      console.log(`> Reda Hammad Academy ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js server:", err);
    process.exit(1);
  });
