import swaggerJSDoc from "swagger-jsdoc";

const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
});

const propertyKeyParameter = (description: string) => ({
  name: "propertyKey",
  in: "path",
  required: true,
  description,
  schema: { type: "string" }
});

const propertyIdParameter = {
  name: "propertyId",
  in: "path",
  required: true,
  schema: { type: "string" }
};

const imageIdParameter = {
  name: "imageId",
  in: "path",
  required: true,
  schema: { type: "string" }
};

const propertySearchParameters = [
  { name: "q", in: "query", description: "Partial city or locality search.", schema: { type: "string", minLength: 1, maxLength: 100 } },
  { name: "city", in: "query", schema: { type: "string", minLength: 1, maxLength: 100 } },
  { name: "type", in: "query", schema: { type: "string", enum: ["APARTMENT", "HOUSE", "VILLA", "PLOT", "COMMERCIAL", "PG"] } },
  { name: "listingType", in: "query", schema: { type: "string", enum: ["SALE", "RENT"] } },
  { name: "minPrice", in: "query", schema: { type: "number", minimum: 0 } },
  { name: "maxPrice", in: "query", schema: { type: "number", minimum: 0, exclusiveMinimum: true } },
  { name: "bedrooms", in: "query", schema: { type: "integer", minimum: 0, maximum: 50 } },
  { name: "sort", in: "query", schema: { type: "string", enum: ["newest", "price_asc", "price_desc"], default: "newest" } },
  { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
  { name: "cursor", in: "query", schema: { type: "string", maxLength: 500 } }
];

export const openApiSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Real Estate Listing API",
      version: "1.0.0",
      description: "API for property listings, authentication, images, and owner inquiries."
    },
    servers: [{ url: "http://localhost:4000", description: "Local development" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        refreshCookie: { type: "apiKey", in: "cookie", name: "refreshToken", description: "HttpOnly refresh-token cookie set by login or registration." }
      },
      schemas: {
        Error: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["code", "message"],
              properties: { code: { type: "string" }, message: { type: "string" }, details: { type: "object", nullable: true } }
            }
          }
        },
        User: {
          type: "object",
          required: ["id", "name", "email", "phone"],
          properties: {
            id: { type: "string" }, name: { type: "string" }, email: { type: "string", format: "email" }, phone: { type: "string", nullable: true }
          }
        },
        AuthResponse: {
          type: "object",
          required: ["accessToken", "user"],
          properties: { accessToken: { type: "string" }, user: { $ref: "#/components/schemas/User" } }
        },
        PropertyImage: {
          type: "object",
          required: ["id", "propertyId", "url", "publicId", "isPrimary", "sortOrder", "createdAt"],
          properties: {
            id: { type: "string" }, propertyId: { type: "string" }, url: { type: "string", format: "uri" }, publicId: { type: "string" },
            isPrimary: { type: "boolean" }, sortOrder: { type: "integer" }, createdAt: { type: "string", format: "date-time" }
          }
        },
        PropertyCard: {
          type: "object",
          required: ["id", "slug", "title", "price", "city", "locality", "propertyType", "listingType", "bedrooms", "createdAt", "primaryImage"],
          properties: {
            id: { type: "string" }, slug: { type: "string" }, title: { type: "string" }, price: { type: "string", description: "Decimal value serialized as a string." },
            city: { type: "string" }, locality: { type: "string" }, propertyType: { type: "string", enum: ["APARTMENT", "HOUSE", "VILLA", "PLOT", "COMMERCIAL", "PG"] },
            listingType: { type: "string", enum: ["SALE", "RENT"] }, bedrooms: { type: "integer", nullable: true }, createdAt: { type: "string", format: "date-time" },
            primaryImage: { type: "string", format: "uri", nullable: true }
          }
        },
        PropertyOwner: {
          type: "object",
          required: ["id", "name", "phone", "email"],
          properties: { id: { type: "string" }, name: { type: "string" }, phone: { type: "string", nullable: true }, email: { type: "string", format: "email" } }
        },
        PropertyInput: {
          type: "object",
          required: ["title", "description", "propertyType", "listingType", "price", "bedrooms", "bathrooms", "areaSqft", "city", "locality", "state", "address"],
          properties: {
            title: { type: "string", minLength: 5, maxLength: 160 }, description: { type: "string", minLength: 20, maxLength: 5000 },
            propertyType: { type: "string", enum: ["APARTMENT", "HOUSE", "VILLA", "PLOT", "COMMERCIAL", "PG"] }, listingType: { type: "string", enum: ["SALE", "RENT"] },
            price: { type: "number", minimum: 0, exclusiveMinimum: true }, depositAmount: { type: "number", minimum: 0, nullable: true },
            bedrooms: { type: "integer", minimum: 0, maximum: 50, nullable: true }, bathrooms: { type: "integer", minimum: 0, maximum: 50, nullable: true },
            areaSqft: { type: "integer", minimum: 1 }, ageYears: { type: "integer", minimum: 0, maximum: 100, nullable: true },
            city: { type: "string", minLength: 2, maxLength: 100 }, locality: { type: "string", minLength: 2, maxLength: 150 },
            state: { type: "string", minLength: 2, maxLength: 100 }, address: { type: "string", minLength: 5, maxLength: 500 }
          }
        },
        PropertyUpdate: {
          type: "object",
          description: "Partial property update. All property fields are optional for PATCH requests.",
          properties: {
            title: { type: "string", minLength: 5, maxLength: 160 }, description: { type: "string", minLength: 20, maxLength: 5000 },
            propertyType: { type: "string", enum: ["APARTMENT", "HOUSE", "VILLA", "PLOT", "COMMERCIAL", "PG"] }, listingType: { type: "string", enum: ["SALE", "RENT"] },
            price: { type: "number", minimum: 0, exclusiveMinimum: true }, depositAmount: { type: "number", minimum: 0, nullable: true },
            bedrooms: { type: "integer", minimum: 0, maximum: 50, nullable: true }, bathrooms: { type: "integer", minimum: 0, maximum: 50, nullable: true },
            areaSqft: { type: "integer", minimum: 1 }, ageYears: { type: "integer", minimum: 0, maximum: 100, nullable: true },
            city: { type: "string", minLength: 2, maxLength: 100 }, locality: { type: "string", minLength: 2, maxLength: 150 },
            state: { type: "string", minLength: 2, maxLength: 100 }, address: { type: "string", minLength: 5, maxLength: 500 }
          }
        },
        PropertyDetail: {
          type: "object",
          required: ["id", "ownerId", "title", "slug", "description", "propertyType", "listingType", "price", "depositAmount", "bedrooms", "bathrooms", "areaSqft", "ageYears", "city", "locality", "state", "address", "createdAt", "updatedAt", "owner", "images"],
          properties: {
            id: { type: "string" }, ownerId: { type: "string" }, title: { type: "string" }, slug: { type: "string" }, description: { type: "string" },
            propertyType: { type: "string", enum: ["APARTMENT", "HOUSE", "VILLA", "PLOT", "COMMERCIAL", "PG"] }, listingType: { type: "string", enum: ["SALE", "RENT"] },
            price: { type: "string" }, depositAmount: { type: "string", nullable: true }, bedrooms: { type: "integer", nullable: true }, bathrooms: { type: "integer", nullable: true },
            areaSqft: { type: "integer" }, ageYears: { type: "integer", nullable: true }, city: { type: "string" }, locality: { type: "string" }, state: { type: "string" }, address: { type: "string" },
            createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" }, owner: { $ref: "#/components/schemas/PropertyOwner" },
            images: { type: "array", items: { $ref: "#/components/schemas/PropertyImage" } }
          }
        },
        PropertyMine: {
          type: "object",
          required: ["id", "ownerId", "title", "slug", "description", "propertyType", "listingType", "price", "depositAmount", "bedrooms", "bathrooms", "areaSqft", "ageYears", "city", "locality", "state", "address", "createdAt", "updatedAt", "images"],
          properties: {
            id: { type: "string" }, ownerId: { type: "string" }, title: { type: "string" }, slug: { type: "string" }, description: { type: "string" },
            propertyType: { type: "string", enum: ["APARTMENT", "HOUSE", "VILLA", "PLOT", "COMMERCIAL", "PG"] }, listingType: { type: "string", enum: ["SALE", "RENT"] },
            price: { type: "string" }, depositAmount: { type: "string", nullable: true }, bedrooms: { type: "integer", nullable: true }, bathrooms: { type: "integer", nullable: true },
            areaSqft: { type: "integer" }, ageYears: { type: "integer", nullable: true }, city: { type: "string" }, locality: { type: "string" }, state: { type: "string" }, address: { type: "string" },
            createdAt: { type: "string", format: "date-time" }, updatedAt: { type: "string", format: "date-time" },
            images: { type: "array", items: { type: "object", required: ["url"], properties: { url: { type: "string", format: "uri" } } } }
          }
        },
        PropertySearchResponse: {
          type: "object",
          required: ["data", "hasMore", "nextCursor"],
          properties: {
            data: { type: "array", items: { $ref: "#/components/schemas/PropertyCard" } }, hasMore: { type: "boolean" }, nextCursor: { type: "string", nullable: true }
          }
        },
        InquiryInput: {
          type: "object",
          required: ["name", "phone", "message"],
          properties: { name: { type: "string", minLength: 2, maxLength: 100 }, phone: { type: "string", pattern: "^[0-9]{10}$" }, message: { type: "string", minLength: 10, maxLength: 1000 }, website: { type: "string", maxLength: 0, description: "Honeypot; leave empty." } }
        },
        Inquiry: {
          type: "object",
          required: ["id", "propertyId", "userId", "name", "phone", "message", "createdAt"],
          properties: { id: { type: "string" }, propertyId: { type: "string" }, userId: { type: "string" }, name: { type: "string" }, phone: { type: "string" }, message: { type: "string" }, createdAt: { type: "string", format: "date-time" } }
        },
        ReceivedInquiry: {
          allOf: [
            { $ref: "#/components/schemas/Inquiry" },
            {
              type: "object",
              required: ["property", "user"],
              properties: {
                property: { type: "object", required: ["id", "title", "slug"], properties: { id: { type: "string" }, title: { type: "string" }, slug: { type: "string" } } },
                user: { type: "object", required: ["id", "name", "email"], properties: { id: { type: "string" }, name: { type: "string" }, email: { type: "string", format: "email" } } }
              }
            }
          ]
        }
      }
    },
    paths: {
      "/health": { get: { summary: "Database health check", responses: { "200": { description: "Database is available" }, "503": errorResponse("Database unavailable") } } },
      "/api-docs.json": { get: { summary: "OpenAPI document", responses: { "200": { description: "OpenAPI JSON document" } } } },
      "/api/auth/register": {
        post: { summary: "Register an account", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string" }, email: { type: "string", format: "email" }, password: { type: "string", format: "password" }, phone: { type: "string" } } } } } }, responses: { "201": { description: "Account created", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } }, "409": errorResponse("Email already used"), "422": errorResponse("Invalid registration details"), "429": errorResponse("Too many requests") } }
      },
      "/api/auth/login": {
        post: { summary: "Log in", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string", format: "password" } } } } } }, responses: { "200": { description: "Authenticated; refresh token is set as an HttpOnly cookie", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } }, "401": errorResponse("Invalid credentials"), "422": errorResponse("Invalid login details"), "429": errorResponse("Too many requests") } }
      },
      "/api/auth/refresh": { post: { summary: "Refresh access token", security: [{ refreshCookie: [] }], responses: { "200": { description: "New rotated session", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } }, "401": errorResponse("Missing or invalid refresh token") } } },
      "/api/auth/logout": { post: { summary: "Log out", security: [{ refreshCookie: [] }], responses: { "204": { description: "Logged out" } } } },
      "/api/auth/me": { get: { summary: "Current user", security: [{ bearerAuth: [] }], responses: { "200": { description: "Current user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } }, "401": errorResponse("Unauthenticated") } } },
      "/api/properties": {
        get: { summary: "Search properties", parameters: propertySearchParameters, responses: { "200": { description: "Cursor-paginated property cards", content: { "application/json": { schema: { $ref: "#/components/schemas/PropertySearchResponse" } } } }, "422": errorResponse("Invalid search filters") } },
        post: { summary: "Create a property", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PropertyInput" } } } }, responses: { "201": { description: "Property created", content: { "application/json": { schema: { $ref: "#/components/schemas/PropertyDetail" } } } }, "401": errorResponse("Unauthenticated"), "422": errorResponse("Invalid property"), "429": errorResponse("Too many requests") } }
      },
      "/api/properties/mine": { get: { summary: "Current user's property listings", security: [{ bearerAuth: [] }], responses: { "200": { description: "Property listings owned by the current user", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/PropertyMine" } } } } }, "401": errorResponse("Unauthenticated") } } },
      "/api/properties/{propertyKey}": {
        get: { summary: "Property detail by slug", parameters: [propertyKeyParameter("Property slug. GET interprets this value as a slug.")], responses: { "200": { description: "Property detail", content: { "application/json": { schema: { $ref: "#/components/schemas/PropertyDetail" } } } }, "404": errorResponse("Property not found") } },
        patch: { summary: "Update own property", security: [{ bearerAuth: [] }], parameters: [propertyKeyParameter("Property CUID. PATCH interprets this value as an ID.")], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PropertyUpdate" } } } }, responses: { "200": { description: "Updated property", content: { "application/json": { schema: { $ref: "#/components/schemas/PropertyDetail" } } } }, "401": errorResponse("Unauthenticated"), "403": errorResponse("Property is owned by another user"), "404": errorResponse("Property not found"), "422": errorResponse("Invalid property update") } },
        delete: { summary: "Delete own property", security: [{ bearerAuth: [] }], parameters: [propertyKeyParameter("Property CUID. DELETE interprets this value as an ID.")], responses: { "204": { description: "Deleted" }, "401": errorResponse("Unauthenticated"), "403": errorResponse("Property is owned by another user"), "404": errorResponse("Property not found") } }
      },
      "/api/properties/{propertyId}/similar": { get: { summary: "Similar properties", parameters: [propertyIdParameter], responses: { "200": { description: "Up to six similar property cards", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/PropertyCard" } } } } }, "404": errorResponse("Property not found") } } },
      "/api/properties/{propertyId}/images": { post: { summary: "Upload property images", security: [{ bearerAuth: [] }], parameters: [propertyIdParameter], requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["images"], properties: { images: { type: "array", maxItems: 5, items: { type: "string", format: "binary" } } } } } } }, responses: { "201": { description: "Images uploaded", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/PropertyImage" } } } } }, "401": errorResponse("Unauthenticated"), "403": errorResponse("Property is owned by another user"), "404": errorResponse("Property not found"), "413": errorResponse("Upload too large"), "422": errorResponse("Invalid upload") } } },
      "/api/properties/{propertyId}/images/{imageId}": { delete: { summary: "Delete property image", security: [{ bearerAuth: [] }], parameters: [propertyIdParameter, imageIdParameter], responses: { "204": { description: "Deleted" }, "401": errorResponse("Unauthenticated"), "403": errorResponse("Property is owned by another user"), "404": errorResponse("Image or property not found") } } },
      "/api/properties/{propertyId}/inquiries": { post: { summary: "Contact a property owner", security: [{ bearerAuth: [] }], parameters: [propertyIdParameter], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/InquiryInput" } } } }, responses: { "201": { description: "Inquiry sent", content: { "application/json": { schema: { allOf: [{ $ref: "#/components/schemas/Inquiry" }, { type: "object", properties: { property: { type: "object", properties: { id: { type: "string" }, title: { type: "string" }, slug: { type: "string" } } } } } ] } } } }, "204": { description: "Spam honeypot submission ignored" }, "401": errorResponse("Unauthenticated"), "404": errorResponse("Property not found"), "409": errorResponse("Duplicate inquiry"), "422": errorResponse("Invalid inquiry"), "429": errorResponse("Too many inquiries") } } },
      "/api/inquiries/received": { get: { summary: "Inquiries received by current owner", security: [{ bearerAuth: [] }], responses: { "200": { description: "Received inquiries", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/ReceivedInquiry" } } } } }, "401": errorResponse("Unauthenticated") } } }
    }
  },
  apis: []
});
