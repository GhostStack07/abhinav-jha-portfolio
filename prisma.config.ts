import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

const url = process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    adapter: async () => {
      // Production: PostgreSQL
      if (url.startsWith("postgres")) {
        const { Pool } = await import("pg");
        const { PrismaPg } = await import("@prisma/adapter-pg");
        return new PrismaPg(new Pool({ connectionString: url }));
      }
      // Development: SQLite via libSQL
      const { PrismaLibSql } = await import("@prisma/adapter-libsql");
      const { createClient } = await import("@libsql/client");
      const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
      return new PrismaLibSql(createClient({ url: `file:${dbPath}` }) as any);
    },
  },
});
