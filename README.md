# Brighte Eats

## How to run

### Backend

```bash
cd backend
npm install
npm run dev
```

The API will run at http://localhost:3001.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will run at http://localhost:5173.

## What I built

A simple full-stack app for collecting expressions of interest for Brighte Eats.

- A REST API with endpoints to create and list leads
- A React form that submits leads to the API
- A leads list that fetches and displays saved submissions
- A service-type filter for the leads list
- A success popup after a lead is submitted
- A scrollable leads list for larger result sets
- Server-side validation for the core fields and service selection

## Why I chose SQLite and Express

I chose SQLite for the backend storage because it is simple, file-based, and requires no separate database service for this assessment. It is a good fit for a small demo or take-home project.

In a real product, I would likely move to PostgreSQL or another managed relational database for better scalability and operational tooling.

## Validation strategy (client vs server)

Validation is handled in both places:

- Client-side validation gives immediate feedback in the form
- Server-side validation is the source of truth and protects the API from invalid input

The backend validates: name, email, mobile, postcode, and at least one selected service.

## What I'd change or add with more time

- Add a small detail view for an individual lead
- Add pagination for very large lead lists

## TODOs / known gaps

- No authentication or authorization
- No deployment configuration yet

## AI Assistance

Where AI helped:
- scaffolding the backend and frontend structure
- generating the initial React form and API integration
- drafting the initial tests and README

One place I checked or corrected AI output:
- I corrected the initial storage choice after the first attempt hit a native-module build issue with `better-sqlite3` on this Windows environment, and switched to Node's built-in SQLite support instead. I changed it because `better-sqlite3` needed native compilation on my Windows setup and failed without Visual Studio build tools, so I kept the project easy to run by using the built-in option.

## Notes

The project is intentionally simple and easy to explain during an interview. The architecture is split into a small backend API and a straightforward React frontend with clearly separated responsibilities.
