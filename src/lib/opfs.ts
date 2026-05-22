export async function saveVectorToOPFS(id: string, vector: Float32Array) {
  try {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(`${id}.vec`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(vector);
    await writable.close();
  } catch (err) {
    console.error('Error saving vector to OPFS:', err);
    throw err;
  }
}

export async function loadVectorFromOPFS(id: string): Promise<Float32Array | null> {
  try {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(`${id}.vec`);
    const file = await fileHandle.getFile();
    const arrayBuffer = await file.arrayBuffer();
    return new Float32Array(arrayBuffer);
  } catch (err) {
    console.error('Error loading vector from OPFS:', err);
    return null;
  }
}

export async function deleteVectorFromOPFS(id: string) {
  try {
    const root = await navigator.storage.getDirectory();
    await root.removeEntry(`${id}.vec`);
  } catch (err) {
    console.error('Error deleting vector from OPFS:', err);
  }
}
