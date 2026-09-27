# Nestora

Nestora is a property listing app for browsing homes, plots, and commercial spaces for sale or rent. Owners can publish listings, manage their properties, upload images, and receive inquiries.

## Features

- Search and filter listings by location, property type, sale or rent, price, and bedrooms; results use cursor pagination.
- View listing details, image galleries, and similar properties.
- Register and sign in, then create, edit, and delete your own listings.
- Upload up to five images per listing.
- Send inquiries to listing owners and view inquiries received for your listings.
- Public listing metadata, JSON-LD structured data, sitemap, and robots routes.
- About, FAQ, privacy, and terms pages.

## Tech Stack

- **Frontend:** Next.js App Router, React, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Express 5, TypeScript
- **Database:** PostgreSQL with Prisma ORM and migrations
- **Authentication:** JWT access tokens, rotating refresh tokens in an HttpOnly cookie, bcrypt password hashes
- **Validation:** Zod
- **Image storage:** Cloudinary
- **API docs:** Swagger UI and an OpenAPI JSON document

## Project Structure

```text
.
|-- server/
|   |-- prisma/              # Schema, migrations, and seed script
|   `-- src/
|       |-- config/          # Environment, Cloudinary, and OpenAPI setup
|       |-- middleware/      # Authentication, ownership, and error handling
|       `-- modules/         # Auth, property, and inquiry routes and logic
|-- web/
|   |-- app/                 # Next.js pages and route handlers
|   |-- components/          # Listing, search, forms, and navigation UI
|   `-- lib/                 # API client, auth state, and shared utilities
|-- PRD.md
|-- DESIGN_SYSTEM.md
|-- DECISIONS.md
`-- PROJECT_PROGRESS.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- A PostgreSQL database
- Cloudinary credentials to enable listing image uploads

The repository does not pin a Node.js version. Install dependencies separately in `server/` and `web/`; there is no root package manifest.

### Installation

1. Configure the backend environment using [`server/.env.example`](server/.env.example) as a reference. Set `DATABASE_URL` to your PostgreSQL connection string and provide the required token secrets.
2. Install and prepare the backend:

   ```sh
   cd server
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   ```

   `prisma:migrate` runs `prisma migrate dev` and applies the checked-in migrations to the configured database.

3. In a second terminal, configure the frontend using [`web/.env.example`](web/.env.example), then install its dependencies:

   ```sh
   cd web
   npm install
   ```

Environment example files contain placeholders, not working credentials. Keep local secrets out of version control.

### Environment Variables

#### Backend (`server/.env`)

```env
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SEED_PROPERTY_COUNT=1000
```

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime mode; defaults to `development`. Refresh cookies are marked secure in `production`. |
| `PORT` | API listen port; defaults to `4000`. |
| `CLIENT_ORIGIN` | Allowed frontend origin for credentialed CORS requests. Required. |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma. Required. |
| `ACCESS_TOKEN_SECRET` | Secret for signing access tokens; required and at least 32 characters. |
| `REFRESH_TOKEN_SECRET` | Separate secret for signing refresh tokens; required and at least 32 characters. |
| `ACCESS_TOKEN_TTL` | Access token lifetime; defaults to `15m`. |
| `REFRESH_TOKEN_TTL` | Refresh token and cookie lifetime; defaults to `7d`. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Configure Cloudinary image uploads. All three are optional at startup, but all are needed to upload images. |
| `SEED_PROPERTY_COUNT` | Number of demo properties created by the seed script; defaults to `1000`. Read by the seed script. |

#### Frontend (`web/.env.local`)

```env
API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

| Variable | Purpose |
| --- | --- |
| `API_URL` | Backend base URL used by server-side page helpers, sitemap generation, and the revalidation route. Defaults to `http://localhost:4000`. |
| `NEXT_PUBLIC_API_URL` | Backend base URL used by browser-side authentication and dashboard requests. Defaults to `http://localhost:4000`. |
| `NEXT_PUBLIC_SITE_URL` | Site base URL used for canonical metadata, sitemap, and robots output. Defaults to `http://localhost:3000`. |

### Running the Project

Start the API from `server/`:

```sh
npm run dev
```

Start the web app from `web/`:

```sh
npm run dev
```

By default, the API is at `http://localhost:4000` and the web app is at `http://localhost:3000`.

## API Documentation

Swagger UI is served at [`http://localhost:4000/api-docs/`](http://localhost:4000/api-docs/) when the API is running. The OpenAPI document is available at [`http://localhost:4000/api-docs.json`](http://localhost:4000/api-docs.json).

Protected endpoints require `Authorization: Bearer <access-token>`, except refresh and logout, which use the `refreshToken` HttpOnly cookie. Listing image uploads use `multipart/form-data` with the `images` field.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Check API and database availability. |
| `POST` | `/api/auth/register` | No | Create an account and start a session. |
| `POST` | `/api/auth/login` | No | Sign in and start a session. |
| `POST` | `/api/auth/refresh` | Refresh cookie | Rotate the refresh session and issue a new access token. |
| `POST` | `/api/auth/logout` | Optional refresh cookie | Revoke the refresh session, if present, and clear its cookie. |
| `GET` | `/api/auth/me` | Yes | Get the current user. |
| `GET` | `/api/properties` | No | Search and cursor-page property cards. Supports `q`, `city`, `type`, `listingType`, `minPrice`, `maxPrice`, `bedrooms`, `sort`, `limit`, and `cursor`. |
| `POST` | `/api/properties` | Yes | Create a listing. |
| `GET` | `/api/properties/mine` | Yes | List the current user's properties. |
| `GET` | `/api/properties/:slug` | No | Get a listing by slug. |
| `PATCH` | `/api/properties/:id` | Owner | Update a listing. |
| `DELETE` | `/api/properties/:id` | Owner | Delete a listing and its images. |
| `GET` | `/api/properties/:id/similar` | No | Get up to six similar listings. |
| `POST` | `/api/properties/:id/images` | Owner | Upload up to five images (5 MB each; JPEG, PNG, or WebP). |
| `DELETE` | `/api/properties/:id/images/:imageId` | Owner | Delete one listing image. |
| `POST` | `/api/properties/:id/inquiries` | Yes | Submit an inquiry about a listing. |
| `GET` | `/api/inquiries/received` | Yes | List inquiries received by the current user's listings. |

## Authentication & Authorization

Passwords are hashed with bcrypt. The API returns a short-lived JWT access token and sets a refresh token in an HttpOnly cookie. Refresh tokens are stored as hashes in `AuthSession` records and rotated when refreshed; access tokens are checked against the user's token version. Listing edits, deletion, and image operations require the authenticated user to own the property.

## Database

The Prisma schema defines:

- `User` — account details and password hash; owns properties and has sessions and inquiries.
- `Property` — listing details, sale or rent type, price, location, and owner.
- `PropertyImage` — Cloudinary URL and public ID, plus primary-image and sort-order fields.
- `Inquiry` — a user's message about a property. A user can submit at most one inquiry per property.
- `AuthSession` — hashed refresh token, expiry, and revocation state.

Schema changes and database migrations are in `server/prisma/`.

## Application Flow

The Next.js app renders public listing pages and calls the Express API. The API validates requests, applies authentication and ownership checks where needed, and reads or writes PostgreSQL through Prisma. Listing image files are uploaded to Cloudinary; their URLs and public IDs are stored in PostgreSQL.

## Error Handling & Validation

Zod schemas validate authentication, property, search, and inquiry input. API errors use a JSON envelope with `error.code`, `error.message`, and optional `error.details`; malformed JSON, unknown routes, upload limits, and unexpected errors are handled by Express middleware.

## Scripts

Run these from the relevant app directory.

| App | Command | Description |
| --- | --- | --- |
| `server` | `npm run dev` | Run the API with `tsx watch`. |
| `server` | `npm run build` | Compile TypeScript to `dist/`. |
| `server` | `npm start` | Run the compiled API. |
| `server` | `npm test` | Run the cursor utility test. |
| `server` | `npm run prisma:generate` | Generate the Prisma client. |
| `server` | `npm run prisma:migrate` | Run Prisma development migrations. |
| `server` | `npm run seed` | Create demo users and properties. |
| `web` | `npm run dev` | Run the Next.js development server. |
| `web` | `npm run build` | Build the Next.js app. |
| `web` | `npm start` | Run the production Next.js server. |
| `web` | `npm run lint` | Run ESLint. |
| `web` | `npm test` | Run the structured-data serialization test. |

