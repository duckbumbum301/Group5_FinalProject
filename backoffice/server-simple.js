// server-simple.js - Json-server với middleware trừ stock
import jsonServer from "json-server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  stockDeductionMiddleware,
  stockRestoreMiddleware,
  productSyncMiddleware,
} from "./server-middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

const PORT = 3000;

// Expose database to middleware
server.use((req, res, next) => {
  req.app.db = router.db.getState();
  next();
});

// Middlewares
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Logging middleware
server.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

server.use(stockDeductionMiddleware);
server.use(stockRestoreMiddleware);
server.use(productSyncMiddleware); // Sync products to file

// Custom render để sync sau khi json-server xử lý
router.render = (req, res) => {
  // Kiểm tra nếu là POST/PUT/PATCH/DELETE /products
  const isProductRoute =
    req.path === "/products" || req.path.startsWith("/products/");
  const isModifyingRequest = ["POST", "PUT", "PATCH", "DELETE"].includes(
    req.method
  );

  if (
    isProductRoute &&
    isModifyingRequest &&
    res.statusCode >= 200 &&
    res.statusCode < 300
  ) {
    try {
      const db = router.db.getState();
      if (db && db.products) {
        const PRODUCTS_FILE = path.join(__dirname, "data", "products.json");
        fs.writeFileSync(
          PRODUCTS_FILE,
          JSON.stringify(db.products, null, 2),
          "utf-8"
        );
        console.log(
          `📝 Synced ${db.products.length} products to data/products.json`
        );
      }
    } catch (error) {
      console.error("❌ Error syncing products:", error.message);
    }
  }

  res.jsonp(res.locals.data);
};

server.use(router);

server.listen(PORT, () => {
  console.log(`\n JSON Server: http://localhost:${PORT}`);
  console.log(` Products: http://localhost:${PORT}/products`);
  console.log(` Orders: http://localhost:${PORT}/orders`);
  console.log(` Users: http://localhost:${PORT}/users\n`);
});
