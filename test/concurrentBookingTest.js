// test/concurrentBookingTest.js
const axios = require("axios");

const BASE_URL = "http://localhost:5000";
const TOTAL_SEATS = 30;
const REQUESTS = 40; // send more than TOTAL_SEATS to verify failures

console.log("Starting 30-seat concurrency test...\n");

async function singleAttempt(i) {
  try {
    const res = await axios.post(`${BASE_URL}/bookings`, {
      showId: 1,
      userName: `Tester${i}`,
      numberOfSeats: 1
    }, { timeout: 5000 });
    return { attempt: i, status: "success", data: res.data };
  } catch (err) {
    const message = err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message;
    return { attempt: i, status: "error", message };
  }
}

async function runTest() {
  const promises = [];
  for (let i = 1; i <= REQUESTS; i++) promises.push(singleAttempt(i));
  const results = await Promise.all(promises);

  const success = results.filter(r => r.status === "success");
  const failed = results.filter(r => r.status === "error");

  console.log("\n===== FINAL REPORT =====");
  console.log("Total Requests:", REQUESTS);
  console.log("Successful Bookings:", success.length);
  console.log("Failed Bookings:", failed.length, "\n");

  if (failed.length) {
    console.log("Failures (first 10):");
    failed.slice(0, 10).forEach(f => console.log(`Attempt ${f.attempt}: ${f.message}`));
  }

  if (success.length) {
    console.log("\nSuccess IDs (first 10):");
    success.slice(0, 10).forEach(s => console.log(`Attempt ${s.attempt} → Booking ID: ${s.data.id}`));
  }

  console.log("\nTest Completed.\n");
  process.exit(0);
}

runTest();
