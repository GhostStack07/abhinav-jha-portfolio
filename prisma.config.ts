import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

const url = process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // For PostgreSQL (production): pass url directly — prisma db push requires it.
  // For SQLite (dev): use the libSQL adapter since SQLite has no native URL support in Prisma 7 CLI.
  datasource: url.startsWith("postgres")
    ? { url }
    : {
        adapter: async () => {
          const { PrismaLibSql } = await import("@prisma/adapter-libsql");
          const { createClient } = await import("@libsql/client");
          const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
          return new PrismaLibSql(createClient({ url: `file:${dbPath}` }) as any);
        },
      },
});
