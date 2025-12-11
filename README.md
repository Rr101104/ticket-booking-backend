# Ticket Booking Backend

Simple ticket booking backend (Node.js + Express + Sequelize + Postgres) — supports show creation, concurrent-safe booking, booking expiry.

## Quick setup (Windows)

1. Install Node.js (v18+) and PostgreSQL.
2. Clone repository:
   ```bash
   git clone <repo-url>
   cd ticket-booking-backend
   ```
3. Install dependencies:
   npm install
4. Create Postgres database:

   Open psql:
   psql -U postgres


   Create DB:
   CREATE DATABASE ticket_booking;
   \q

5. Configure DB (if needed):
   - Edit `config/config.json` development section to match Postgres user/password/port.

6. Run migrations:
   npx sequelize-cli db:migrate

7. Start server:
   node server.js
   Server runs on:  
   http://localhost:5000

## API Endpoints

All request bodies are JSON. Thunder Client / Postman

###  Shows

#### GET /shows
Returns list of shows.

Example:
GET http://localhost:5000/shows

#### POST /shows
Create a new show.

Body:
 json
{
  "name": "Morning Show",
  "startTime": "2025-12-10 10:00:00",
  "seats": 40
}

Example:

POST http://localhost:5000/shows

###  Bookings

#### GET /bookings
List all bookings.

#### POST /bookings
Create a booking (concurrency-safe).

Body:
```json
{
  "showId": 1,
  "userName": "Alice",
  "numberOfSeats": 2
}
```

Behavior:
- Booking is created with:
  - `status: "PENDING"`
  - `expiresAt = now + 2 minutes`
- Seats are reserved instantly.
- Must confirm using `POST /bookings/:id/confirm`.

#### POST /bookings/:id/confirm
Confirm a pending booking.

Example:
```
POST http://localhost:5000/bookings/50/confirm
```

## Concurrency & Expiry

- Uses DB transaction + `FOR UPDATE` lock to avoid race conditions.
- Background worker runs every 30 sec:
  - Finds expired PENDING bookings
  - Marks them FAILED
  - Restores seats to Show

##  Tests

### Concurrency stress test
File: `test/concurrentBookingTest.js`

Run server:
```bash
node server.js
```

Run test:
```bash
node test/concurrentBookingTest.js
```
## What is implemented

- Shows model + creation + listing
- Bookings with `PENDING`, `CONFIRMED`, `FAILED`
- Expiry mechanism with seat restoration
- Concurrency-safe booking logic
- Stress test script

