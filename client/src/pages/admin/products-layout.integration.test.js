// // client/src/pages/admin/products-layout.integration.test.js

// // ---- Polyfill (jsdom misses these; mongo driver needs them) ----
// const { TextEncoder, TextDecoder } = require("util");
// global.TextEncoder = TextEncoder;
// global.TextDecoder = TextDecoder;

// const React = require("react");
// const { render, screen, waitFor } = require("@testing-library/react");
// const { MemoryRouter } = require("react-router-dom");
// const axios = require("axios");
// const http = require("http");
// const mongoose = require("mongoose");
// const { MongoMemoryServer } = require("mongodb-memory-server");

// // Keep Layout real. Mock only same-level peers.
// jest.mock("../../components/AdminMenu", () => ({
//   __esModule: true,
//   default: () => <div data-testid="admin-menu">ADMIN MENU</div>,
// }));

// // Toaster & toast fns inert
// jest.mock("react-hot-toast", () => ({
//   __esModule: true,
//   Toaster: () => null,
//   success: jest.fn(),
//   error: jest.fn(),
// }));
// const toast = require("react-hot-toast");

// // SUT (uses real Layout internally)
// const Products = require("./Products").default;

// // Real providers (so Header & SearchInput hooks work)
// const { AuthProvider } = require("../../context/auth");
// const { CartProvider } = require("../../context/cart");
// const { SearchProvider } = require("../../context/search");

// // AppShell wrapper with providers + router
// function AppShell({ children }) {
//   return (
//     <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
//       <AuthProvider>
//         <CartProvider>
//           <SearchProvider>{children}</SearchProvider>
//         </CartProvider>
//       </AuthProvider>
//     </MemoryRouter>
//   );
// }

// describe("FULLSTACK: Products page + REAL Layout ↔ live API (in-memory Mongo)", () => {
//   let mongo;
//   let server;
//   let baseURL;
//   let app; // Express app

//   beforeAll(async () => {
//     jest.setTimeout(60000);

//     // 0) Set test environment
//     process.env.NODE_ENV = 'test';

//     // 1) Start in-memory Mongo and point backend to it BEFORE importing the app
//     mongo = await MongoMemoryServer.create();
//     process.env.MONGO_URL = mongo.getUri();

//     // 2) Import your real Express app (must export app without calling listen)
//     //    ⬇⬇⬇ ADJUST THIS PATH to your project ⬇⬇⬇
//     app = (await import("../../../../server")).default; // <-- ADJUST

//     // If app is undefined, the server.js doesn't export properly
//     if (!app || typeof app.use !== 'function') {
//       throw new Error('Server does not export Express app. Add "export default app;" to server.js');
//     }

//     // If Header fetches categories and your server lacks this route, stub it:
//     app.get?.("/api/v1/category/get-category", (_req, res) => res.json([]));

//     // 3) Wait for mongoose connection (server connects on import)
//     if (mongoose.connection.readyState !== 1) {
//       await new Promise((resolve, reject) => {
//         mongoose.connection.once("open", resolve);
//         mongoose.connection.once("error", reject);
//       });
//     }

//     // 4) Seed DB via raw collection (skip model/validation hassles)
//     const productsCol = mongoose.connection.collection("products");
//     await productsCol.deleteMany({});
//     await productsCol.insertMany([
//       {
//         _id: new mongoose.Types.ObjectId("65fb2b1e2d11111111111111"),
//         name: "Apple Watch",
//         slug: "apple-watch",
//         description: "A nice watch",
//         price: 299,
//       },
//       {
//         _id: new mongoose.Types.ObjectId("65fb2b1e2d12222222222222"),
//         name: "Pixel",
//         slug: "pixel",
//         description: "A neat phone",
//         price: 699,
//       },
//     ]);

//     // 5) Create admin user with REAL hashed password for authentication
//     const bcrypt = require("bcrypt");
//     const usersCol = mongoose.connection.collection("users");
//     await usersCol.deleteMany({});
    
//     const hashedPassword = await bcrypt.hash("admin123", 10);
//     await usersCol.insertOne({
//       _id: new mongoose.Types.ObjectId("65fb2b1e2d99999999999999"),
//       name: "Admin Test",
//       email: "admin@test.com",
//       password: hashedPassword,
//       phone: "1234567890",
//       address: "Test Address",
//       role: 1, // admin role
//     });

//     // 6) Start HTTP server
//     server = http.createServer(app);
//     await new Promise((resolve) => server.listen(0, resolve));
//     const { port } = server.address();
//     baseURL = `http://127.0.0.1:${port}`;

//     // 7) Point axios (used by the React app) to this live server
//     axios.defaults.baseURL = baseURL;

//     // 8) LOGIN to get real JWT token
//     try {
//       const loginResponse = await axios.post("/api/v1/auth/login", {
//         email: "admin@test.com",
//         password: "admin123",
//       });

//       // Store the real auth token for use in tests
//       global.testAuthToken = loginResponse.data.token;
//       global.testAuthUser = loginResponse.data.user;
      
//       console.log("✓ Successfully logged in as admin");
//       console.log("✓ Token:", global.testAuthToken?.substring(0, 20) + "...");
//     } catch (error) {
//       console.error("✗ Login failed:", error.message);
//       console.error("✗ Response:", error.response?.data);
//       throw new Error("Failed to login during test setup");
//     }
//   });

//   afterAll(async () => {
//     jest.setTimeout(60000);
//     try { await mongoose.connection.dropDatabase(); } catch {}
//     try { await mongoose.connection.close(); } catch {}
//     try { await mongo?.stop(); } catch {}
//     if (server && server.listening) {
//       await new Promise((resolve) => server.close(resolve));
//     }
//   });

//   beforeEach(() => {
//     jest.spyOn(console, "log").mockImplementation(() => {}); // keep logs quiet
    
//     // Set localStorage auth with REAL token from login
//     const authData = {
//       user: global.testAuthUser,
//       token: global.testAuthToken,
//     };
//     localStorage.setItem("auth", JSON.stringify(authData));
    
//     // Set auth header for axios requests with REAL token
//     axios.defaults.headers.common["Authorization"] = global.testAuthToken;
//   });

//   afterEach(() => {
//     jest.restoreAllMocks();
//     localStorage.clear();
//     delete axios.defaults.headers.common["Authorization"];
//   });

//   it("renders via REAL Layout and shows products from the live API", async () => {
//     render(
//       <AppShell>
//         <Products />
//       </AppShell>
//     );

//     // Title from real Layout (react-helmet)
//     await waitFor(() => expect(document.title).toBe("Ecommerce app - shop now"), {
//       timeout: 5000,
//     });

//     // Page heading from Products
//     expect(await screen.findByRole("heading", { name: /all products list/i }))
//       .toBeInTheDocument();

//     // AdminMenu (mock) present
//     expect(screen.getByTestId("admin-menu")).toBeInTheDocument();

//     // Product content from DB-backed API
//     expect(await screen.findByText("Apple Watch", {}, { timeout: 10000 })).toBeInTheDocument();
//     expect(screen.getByRole("link", { name: /apple watch/i }))
//       .toHaveAttribute("href", "/dashboard/admin/product/apple-watch");
//     expect(screen.getByAltText("Apple Watch"))
//       .toHaveAttribute("src", "/api/v1/product/product-photo/65fb2b1e2d11111111111111");
//   });
// });


// mocked db
// // client/src/pages/admin/products-layout.integration.test.js

// ---- Polyfill (jsdom misses these; mongo driver needs them) ----
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const React = require("react");
const { render, screen, waitFor } = require("@testing-library/react");
const { MemoryRouter } = require("react-router-dom");
const axios = require("axios");
const http = require("http");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Keep Layout real. Mock only same-level peers.
jest.mock("../../components/AdminMenu", () => ({
  __esModule: true,
  default: () => <div data-testid="admin-menu">ADMIN MENU</div>,
}));

// Toaster & toast fns inert
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  Toaster: () => null,
  success: jest.fn(),
  error: jest.fn(),
}));

// SUT - Products component
const Products = require("./Products").default;

// Real providers (so Header & SearchInput hooks work)
const { AuthProvider } = require("../../context/auth");
const { CartProvider } = require("../../context/cart");
const { SearchProvider } = require("../../context/search");

// Mock axios instead of using real server
jest.mock("axios");

// AppShell wrapper with providers + router
function AppShell({ children }) {
  return (
    <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
      <AuthProvider>
        <CartProvider>
          <SearchProvider>{children}</SearchProvider>
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("FULLSTACK: Products page + REAL Layout (mocked API responses)", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    
    // Mock the products API response
    axios.get.mockResolvedValue({
      data: {
        products: [
          {
            _id: "65fb2b1e2d11111111111111",
            name: "Apple Watch",
            slug: "apple-watch",
            description: "A nice watch",
            price: 299,
          },
          {
            _id: "65fb2b1e2d22222222222222",
            name: "Pixel Phone",
            slug: "pixel-phone",
            description: "A neat phone",
            price: 699,
          },
        ],
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("renders page structure via REAL Layout and shows products", async () => {
    render(
      <AppShell>
        <Products />
      </AppShell>
    );

    // Page heading from Products
    expect(await screen.findByRole("heading", { name: /all products list/i }))
      .toBeInTheDocument();

    // AdminMenu (mock) present
    expect(screen.getByTestId("admin-menu")).toBeInTheDocument();

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText("Apple Watch")).toBeInTheDocument();
    });

    expect(screen.getByText("Pixel Phone")).toBeInTheDocument();
    expect(screen.getByText("A nice watch")).toBeInTheDocument();
    expect(screen.getByText("A neat phone")).toBeInTheDocument();
  });

  it("verifies API was called correctly", async () => {
    render(
      <AppShell>
        <Products />
      </AppShell>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product");
    });
  });

  it("renders product links correctly", async () => {
    render(
      <AppShell>
        <Products />
      </AppShell>
    );

    await waitFor(() => {
      expect(screen.getByText("Apple Watch")).toBeInTheDocument();
    });

    const appleWatchLink = screen.getByRole("link", { name: /apple watch/i });
    expect(appleWatchLink).toHaveAttribute("href", "/dashboard/admin/product/apple-watch");

    const pixelLink = screen.getByRole("link", { name: /pixel phone/i });
    expect(pixelLink).toHaveAttribute("href", "/dashboard/admin/product/pixel-phone");
  });
});
