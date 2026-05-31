// Passenger default startup file.
//
// Hostinger's CloudLinux Node.js / Passenger looks for `app.js` by default as
// the application startup file. We simply delegate to server.js (the custom
// Next.js server) so the app boots the same way regardless of whether the host
// runs `npm start` or loads this file directly.
require("./server.js");
