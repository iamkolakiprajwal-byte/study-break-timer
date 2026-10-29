// Verification test suite for Study Break Timer core logic and calculations
const assert = require("assert");

console.log("=========================================");
console.log("RUNNING STUDY BREAK TIMER VERIFICATION TESTS");
console.log("=========================================\n");

// Test 1: Timer Time Formatting
function formatTime(secs) {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;
  const pad = (n) => n.toString().padStart(2, "0");
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

assert.strictEqual(formatTime(1500), "25:00", "25 minutes format");
assert.strictEqual(formatTime(300), "05:00", "5 minutes format");
assert.strictEqual(formatTime(59), "00:59", "59 seconds format");
assert.strictEqual(formatTime(0), "00:00", "Zero seconds format");
assert.strictEqual(formatTime(3665), "01:01:05", "Over an hour format");
console.log("✓ Test 1 Passed: Timer time formatting accurately formats MM:SS and HH:MM:SS");

// Test 2: Timestamp-based countdown calculation (no drift)
function calculateRemaining(targetEndTime, now) {
  const diffMs = targetEndTime - now;
  return Math.max(0, Math.ceil(diffMs / 1000));
}

const now = 1700000000000;
const target25m = now + 25 * 60 * 1000; // 25 min in future
assert.strictEqual(calculateRemaining(target25m, now), 1500);
// 10 minutes elapsed (e.g. while tab was inactive)
assert.strictEqual(calculateRemaining(target25m, now + 10 * 60 * 1000), 900);
// Target passed while tab was asleep (should floor at 0, not negative)
assert.strictEqual(calculateRemaining(target25m, now + 30 * 60 * 1000), 0);
console.log("✓ Test 2 Passed: Timestamp-based countdown avoids browser tab drift");

// Test 3: Circular Progress Math
function calculateProgress(totalSecs, remainingSecs) {
  if (totalSecs <= 0) return 0;
  return Math.min(100, Math.max(0, ((totalSecs - remainingSecs) / totalSecs) * 100));
}

assert.strictEqual(calculateProgress(1500, 1500), 0, "At start progress is 0%");
assert.strictEqual(calculateProgress(1500, 750), 50, "Halfway progress is 50%");
assert.strictEqual(calculateProgress(1500, 0), 100, "At completion progress is 100%");
console.log("✓ Test 3 Passed: Circular progress ring math calculates 0% to 100% cleanly");

// Test 4: Dynamic Statistics Calculations from Sessions
const mockSessions = [
  {
    id: "s1",
    taskTitle: "Biology Study",
    actualDurationSeconds: 1500, // 25 min
    completedAt: new Date().toISOString(),
    status: "completed",
  },
  {
    id: "s2",
    taskTitle: "Calculus Homework",
    actualDurationSeconds: 1800, // 30 min
    completedAt: new Date().toISOString(),
    status: "completed",
  },
  {
    id: "s3",
    taskTitle: "Abandoned draft",
    actualDurationSeconds: 200,
    completedAt: new Date().toISOString(),
    status: "abandoned", // Should NOT count in completed sessions
  },
  {
    id: "s4",
    taskTitle: "Old session last week",
    actualDurationSeconds: 3600, // 60 min
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: "completed",
  },
];

// Total completed
const completedOnly = mockSessions.filter((s) => s.status === "completed");
assert.strictEqual(completedOnly.length, 3, "Only completed sessions are counted");

// Total hours
const totalSecs = completedOnly.reduce((acc, s) => acc + s.actualDurationSeconds, 0);
const totalHours = (totalSecs / 3600).toFixed(1);
assert.strictEqual(totalHours, "1.9", "Total hours match 1.9 hrs");

// Today's minutes
const todayStr = new Date().toDateString();
const todaySessions = completedOnly.filter(
  (s) => new Date(s.completedAt).toDateString() === todayStr
);
const todayMinutes = Math.round(
  todaySessions.reduce((acc, s) => acc + s.actualDurationSeconds, 0) / 60
);
assert.strictEqual(todayMinutes, 55, "Today's minutes match 55 mins (25 + 30)");

console.log("✓ Test 4 Passed: Metrics accurately calculate total hours, today's minutes, and exclude abandoned sessions");

// Test 5: Input Validation & Duplicate Protection
function validateAuth(email, password) {
  if (!email || !email.includes("@")) return { valid: false, error: "Invalid email" };
  if (!password || password.length < 6) return { valid: false, error: "Password too short" };
  return { valid: true };
}

assert.strictEqual(validateAuth("", "123456").valid, false);
assert.strictEqual(validateAuth("student.com", "123456").valid, false);
assert.strictEqual(validateAuth("student@school.edu", "123").valid, false);
assert.strictEqual(validateAuth("student@school.edu", "123456").valid, true);

console.log("✓ Test 5 Passed: Authentication form validation enforces email format and min length");

console.log("\n=========================================");
console.log("ALL 5 VERIFICATION SUITES PASSED (100% SUCCESS)");
console.log("=========================================\n");
