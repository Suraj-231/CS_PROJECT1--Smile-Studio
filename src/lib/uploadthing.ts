"use server";
import { UTApi } from "uploadthing/server";
const utapi = new UTApi();

export async function uploadFilesFromServer(
  inputFile: File | null,
): Promise<string> {
  if (!inputFile) throw new Error("No input file provided!");
  const response = await utapi.uploadFiles(inputFile);

  if (response.error) {
    console.error("Upload failed:", response.error.message);
    throw new Error("Uploadthing Upload Failed");
  } else {
    console.log("Uploaded successfully:", response.data.ufsUrl);
    return response.data.ufsUrl;
  }
}
