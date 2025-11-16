// -----------------------------------------------------------------------------
// Swagger / OpenAPI 3.0 – ParentFacile API
// -----------------------------------------------------------------------------

import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "ParentFacile API",
    version: "1.0.0",
    description:
      "Documentation officielle de l’API ParentFacile : démarches, documents PDF, contact et administration.",
  },
  servers: [
    {
      url: "https://parentfacile.alwaysdata.net",
      description: "Production",
    },
    {
      url: "http://localhost:4000",
      description: "Développement local",
    },
  ],
  components: {
    securitySchemes: {
      AdminJWT: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token administrateur (Bearer ou Cookie HttpOnly selon la configuration).",
      },
    },
  },
};

export const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [
    "./server.js",
    "./src/routes/*.js",
  ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
