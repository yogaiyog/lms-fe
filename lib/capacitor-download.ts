import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const TAG = "[capacitor-download]";

export function isNativePlatform() {
  return Capacitor.isNativePlatform();
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = (e) => {
      console.error(TAG, "blobToBase64 failed:", e);
      reject(e);
    };
    reader.readAsDataURL(blob);
  });
}

export async function downloadFileCapacitor(blob: Blob, fileName: string) {
  console.log(TAG, "Starting native download:", fileName, "size:", blob.size, "type:", blob.type);

  if (blob.size === 0) {
    console.error(TAG, "Blob is empty!");
    alert("File kosong, silakan coba lagi");
    return;
  }

  try {
    const base64 = await blobToBase64(blob);
    console.log(TAG, "Base64 converted, length:", base64.length);

    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
    });
    console.log(TAG, "File written:", result.uri);

    await Share.share({ title: fileName, files: [result.uri] });
    console.log(TAG, "Share completed successfully");
  } catch (err) {
    console.error(TAG, "Native download failed:", err);
    alert("Gagal download: " + (err instanceof Error ? err.message : String(err)));
  }
}

export function downloadFileWeb(blob: Blob, fileName: string) {
  console.log(TAG, "Using web download:", fileName, "size:", blob.size);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
