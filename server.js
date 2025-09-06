// server.js
import app from "./app.js";

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Auth server running on http://localhost:${PORT}`);
  });
}
