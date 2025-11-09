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
      "style-src": ["'self'", "'unsafe-inline'"], // Allow 'self' and inline styles
      "img-src": ["'self'", "data:"], // Allow 'self' and data: images
      "connect-src": [
        "'self'",
        "https://*.braintreegateway.com",
        "https://*.paypal.com",
      ],
    },
  })
);
app.use(helmet.frameguard({ action: "deny" })); // Prevents clickjacking
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true })); // Enforce HTTPS
app.use(helmet.noSniff()); // Sets X-Content-Type-Options

// 3. CONFIGURE CORS
// This fixes the "Cross-Domain Misconfiguration"
// It restricts requests to only your frontend application
const allowedOrigins = [
  'http://localhost:3000', // Default React dev port
  // Add your *production* frontend URL here when you deploy
  // e.g., 'https://your-app-domain.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};
app.use(cors(corsOptions));
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