/**
 * Downloads a file from a string.
 * @param content The content of the file.
 * @param filename The name of the file.
 * @param type The MIME type of the file.
 */
export function downloadFile(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
