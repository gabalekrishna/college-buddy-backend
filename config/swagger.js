import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "College Buddy API",
    version: "1.0.0",
    description:
      "API documentation for College Buddy backend. Includes authentication, users, and more.",
  },
  servers: [
    { url: "http://localhost:3000", description: "Local" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          college: { type: "string" },
          year: { type: "string" },
          isVerified: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          token: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      UsersListResponse: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          pages: { type: "integer" },
          users: {
            type: "array",
            items: { $ref: "#/components/schemas/User" },
          },
        },
      },
    },
  },
  paths: {
    "/api/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  college: { type: "string" },
                  year: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
          },
          400: { description: "User already exists" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and retrieve JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
          },
          400: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { user: { $ref: "#/components/schemas/User" } },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List users with pagination and search",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
          { in: "query", name: "q", schema: { type: "string" } },
          { in: "query", name: "verified", schema: { type: "string", enum: ["true", "false"] } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UsersListResponse" } },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [
    "./routes/*.js",
    "./models/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
