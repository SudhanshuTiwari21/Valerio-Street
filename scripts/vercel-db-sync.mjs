import { execSync } from "node:child_process";

function shouldRun() {
  if (!process.env.DATABASE_URL) return false;
  if (process.env.SKIP_DB_SYNC === "true") return false;
  // Vercel sets VERCEL=1. Allow CI builds too.
  return process.env.VERCEL === "1" || process.env.CI === "true" || process.env.NODE_ENV === "production";
}

if (!shouldRun()) {
  console.log("[db-sync] skipped");
  process.exit(0);
}

console.log("[db-sync] prisma db push");
execSync("npx prisma db push", { stdio: "inherit" });

