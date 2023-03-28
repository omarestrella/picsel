import { load } from "https://deno.land/std@0.180.0/dotenv/mod.ts";
import { connect } from "npm:@planetscale/database";

const { DATABASE_HOST, DATABASE_PASSWORD, DATABASE_USERNAME } = await load();

export const connection = connect({
  host: DATABASE_HOST,
  username: DATABASE_USERNAME,
  password: DATABASE_PASSWORD,
});

export async function createProject() {}
