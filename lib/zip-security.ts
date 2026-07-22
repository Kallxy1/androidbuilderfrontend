import JSZip from "jszip";

const sensitivePatterns = [
  /(^|\/)\.env(\.|$|\/)?/i,
  /(^|\/)local\.properties$/i,
  /(^|\/)id_rsa$/i,
  /(^|\/)id_dsa$/i,
  /(^|\/)google-services\.json$/i,
  /(^|\/)service-account.*\.json$/i,
  /\.(jks|keystore|p12|pem|key)$/i,
  /(^|\/)(secrets?|credentials?)\.(json|ya?ml|txt|properties)$/i
];

export async function inspectZip(buffer: ArrayBuffer) {
  const zip = await JSZip.loadAsync(buffer);
  const entries = Object.values(zip.files);
  const files = entries.filter((entry) => !entry.dir);
  const unsafePaths: string[] = [];
  const sensitive: string[] = [];
  const tooManyFiles = files.length > 5000;

  for (const entry of entries) {
    const name = entry.name.replace(/\\/g, "/");
    if (name.startsWith("/") || name.split("/").includes("..")) unsafePaths.push(entry.name);
    if (!entry.dir && sensitivePatterns.some((pattern) => pattern.test(name))) sensitive.push(entry.name);
    if (unsafePaths.length > 20 || sensitive.length > 20) break;
  }

  return {
    zip,
    fileCount: files.length,
    unsafePaths,
    sensitive,
    tooManyFiles
  };
}
