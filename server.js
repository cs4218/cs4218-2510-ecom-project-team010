import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoute.js'
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cors from "cors";
import helmet from "helmet";

// configure env
dotenv.config();

//database config
connectDB();

const app = express();

//middlewares
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": [
        "'self'",
        "https://*.braintreegateway.com",
        "https://*.paypal.com",
      ],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:"],
      "connect-src": [
        "'self'",
        "https://*.braintreegateway.com",
        "https://*.paypal.com",
      ],
    },
  })
);
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
app.use(helmet.noSniff());

// 3. CONFIGURE CORS
// Restrict in production, relax for local/dev/test (Playwright etc.)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://your-production-domain.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (server-side, Postman, Playwright runner) or with origin "null"
    if (!origin || origin === 'null') return callback(null, true);

    // Allow any localhost / 127.0.0.1 on any port (useful for dev and testing)
    const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
    if (localhostRegex.test(origin)) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

// decide environment: treat DEV_MODE or NODE_ENV === 'development' as local
const isLocal =
  process.env.NODE_ENV === 'development' ||
  process.env.DEV_MODE === 'development' ||
  !process.env.NODE_ENV; // fallback to local if NODE_ENV unset


if (isLocal) {
  // relaxed for local/dev/testing (including Playwright)
  app.use(cors()); // allow all origins locally
} else {
  // strict CORS in production
  app.use(cors(corsOptions));
}

app.use(express.json());
app.use(morgan('dev'));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

// rest api
app.get('/', (req,res) => {
    res.send("<h1>Welcome to ecommerce app</h1>");
});

const PORT = process.env.PORT || 6060;

app.listen(PORT, () => {
    console.log(`Server running on ${process.env.DEV_MODE} mode on ${PORT}`.bgCyan.white);
});