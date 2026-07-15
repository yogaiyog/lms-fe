import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { PdfViewer } from "@capawesome/capacitor-pdf-viewer";

const TAG = "[capacitor-pdf]";

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

export async function writeBlobToCache(blob: Blob, fileName: string): Promise<string> {
  if (blob.size === 0) throw new Error("Blob kosong, tidak bisa membuat file sementara");
  const base64 = await blobToBase64(blob);
  await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Cache,
    recursive: true,
  });
  const { uri } = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
  console.log(TAG, "Cache file written:", uri);
  return uri;
}

export async function openPdfViewerNative(
  blob: Blob,
  fileName: string,
  title?: string,
): Promise<void> {
  console.log(TAG, "Opening native PDF viewer:", fileName);
  const path = await writeBlobToCache(blob, fileName);
  await PdfViewer.open({ path, title: title ?? fileName });
}

export function addPdfViewerClosedListener(listener: () => void): Promise<PluginListenerHandle> {
  return PdfViewer.addListener("closed", listener);
}

export async function closePdfViewerNative(): Promise<void> {
  await PdfViewer.close();
}
