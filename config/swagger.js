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
      Listing: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          author: { type: "string" },
          course: { type: "string" },
          description: { type: "string" },
          condition: { type: "string", enum: ["new", "like_new", "good", "fair", "poor"] },
          price: { type: "number" },
          imageUrl: { type: "string" },
          seller: { $ref: "#/components/schemas/User" },
          isSold: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ListingsListResponse: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          pages: { type: "integer" },
          listings: {
            type: "array",
            items: { $ref: "#/components/schemas/Listing" },
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
    "/api/listings": {
      get: {
        tags: ["Listings"],
        summary: "List listings with pagination and filters",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
          { in: "query", name: "q", schema: { type: "string" } },
          { in: "query", name: "minPrice", schema: { type: "number" } },
          { in: "query", name: "maxPrice", schema: { type: "number" } },
          { in: "query", name: "condition", schema: { type: "string", enum: ["new", "like_new", "good", "fair", "poor"] } },
          { in: "query", name: "seller", schema: { type: "string" } },
          { in: "query", name: "isSold", schema: { type: "string", enum: ["true", "false"] } },
        ],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ListingsListResponse" } },
            },
          },
        },
      },
      post: {
        tags: ["Listings"],
        summary: "Create a new listing (multipart/form-data)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  author: { type: "string" },
                  course: { type: "string" },
                  description: { type: "string" },
                  condition: { type: "string", enum: ["new", "like_new", "good", "fair", "poor"] },
                  price: { type: "number" },
                  image: { type: "string", format: "binary" },
                },
                required: ["title", "price"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Listing created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Listing" } } },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/listings/{id}": {
      get: {
        tags: ["Listings"],
        summary: "Get listing by id",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Success", content: { "application/json": { schema: { $ref: "#/components/schemas/Listing" } } } },
          404: { description: "Not Found" },
        },
      },
    },
    "/api/listings/me": {
      get: {
        tags: ["Listings"],
        summary: "Get my listings",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success", content: { "application/json": { schema: { $ref: "#/components/schemas/ListingsListResponse" } } } },
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
