import { z } from "zod";

export const Project = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.string(),
  document_id: z.string(),
});

export type Project = z.infer<typeof Project>;

export const User = z.object({
  id: z.number(),
  email: z.string(),
});

export const ProjectAccess = z.object({
  id: z.number(),
  accessLevel: z.enum(["read", "write"]),
});
