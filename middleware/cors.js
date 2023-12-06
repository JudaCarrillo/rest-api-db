import cors from "cors";

const ACCEPTED_ORIGINS = [
  "http://localhost/8080",
  "http://localhost/1234",
  "http://movies.com",
  "http://midu.dev.com",
  "http://127.0.0.1:5500",
];

export const corsMiddleware = (acceptedOrigins = ACCEPTED_ORIGINS) => {
  return cors({
    origin: (origin, callback) => {
      if (acceptedOrigins.includes(origin) || !origin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  });
};
