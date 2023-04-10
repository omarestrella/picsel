import { load } from "https://deno.land/std@0.181.0/dotenv/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.1.0";

await load();

export const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_KEY") ?? ""
);

export async function getProjectData(owner: string, documentID: string) {
  const file = await supabase.storage
    .from("documents")
    .download(`${owner}/${documentID}`);
  if (file.error) {
    throw new Error(file.error.message);
  }
  if (!file.data) {
    throw new Error("File not found");
  }
  return new Uint8Array(await file.data.arrayBuffer());
}

export async function writeProjectData(
  owner: string,
  documentID: string,
  documentData: Uint8Array
) {
  const file = await supabase.storage
    .from("documents")
    .upload(
      `${owner}/${documentID}`,
      new Blob([documentData], { type: "application/octet-stream" }),
      {
        upsert: true,
        contentType: "application/octet-stream",
      }
    );
  if (file.error) {
    throw new Error(file.error.message);
  }
  if (!file.data) {
    throw new Error("File not found");
  }
}

export async function getProject(projectID: string) {
  const project = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectID)
    .single();
  if (project.error) {
    throw new Error(project.error.message);
  }
  if (!project.data) {
    throw new Error("Project not found");
  }
  return project.data;
}

export async function getProjectForDocumentID(documentID: string) {
  const project = await supabase
    .from("projects")
    .select("*")
    .eq("document_id", documentID)
    .single();
  if (project.error) {
    throw new Error(project.error.message);
  }
  if (!project.data) {
    throw new Error("Project not found");
  }
  return project.data;
}
