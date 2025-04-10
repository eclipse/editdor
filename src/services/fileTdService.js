/**
 * Check if the Browser Supports the new Native File System Api (Chromium 86.0)
 */
const hasNativeFS = () => {
  return "chooseFileSystemEntries" in window || "showOpenFilePicker" in window;
};

/**
 * Open a TD from the local file system.
 */
const readFromFile = async () => {
  if (!hasNativeFS()) {
    const file = await getFileHTML5();
    if (!file) {
      throw new Error("failed to get file through HTML5");
    }

    const tdStr = await readFileHTML5(file);
    return {
      td: tdStr,
      fileName: file.name,
    };
  }

  const fileHandle = await getReadFileHandle();
  const file = await fileHandle.getFile();
  const tdStr = await file.text();

  return {
    td: tdStr,
    fileName: file.name,
    fileHandle: fileHandle,
  };
};

/**
 * Open file input and return file contents.
 */
const getFileHTML5 = async () => {
  return new Promise((resolve, reject) => {
    const fileInput = document.getElementById("fileInput");
    fileInput.onchange = (e) => {
      const file = fileInput.files[0];
      if (file) {
        return resolve(file);
      }
      return reject(new Error("AbortError"));
    };
    fileInput.click();
  });
};

const readFileHTML5 = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("loadend", (event) => {
      const text = event.srcElement.result;
      return resolve(text);
    });
    reader.readAsText(file);
  });
};

/**
 *
 * @param {string} fileName
 * @param {object} fileHandle
 * @param {string} tdStr
 * @returns
 *
 * If fileHandle is undefined, a new file will be created otherwise
 * the existing file will be updated. Returns the used file handle object
 * or the file name.
 */
const saveToFile = async (fileName, fileHandle, tdStr) => {
  if (!hasNativeFS()) {
    downloadTdHTML5(fileName, tdStr);
    return fileName;
  }

  if (!fileHandle) {
    try {
      fileHandle = await getWriteFileHandle();
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  await writeToFile(fileHandle, tdStr);
  return fileHandle;
};

/**
 *
 * @param {object} fileHandle
 * @param {string} tdStr
 * @returns
 */
const writeToFile = async (fileHandle, tdStr) => {
  if (fileHandle.createWriter) {
    const writer = await fileHandle.createWriter();
    await writer.write(0, tdStr);
    await writer.close();
    return;
  }

  const writable = await fileHandle.createWritable();
  await writable.write(tdStr);
  await writable.close();
};

/**
 *
 * @param {string} filename
 * @param {string} tdStr
 */
const downloadTdHTML5 = (filename, tdStr) => {
  const td = JSON.parse(tdStr);
  let tdTitle = td["id"] || td["title"];
  if (!tdTitle) {
    throw Error("the TD has to have either an id or a title to be saved");
  }

  tdTitle = tdTitle.replace(/\s/g, "") + ".jsonld";
  filename = filename || tdTitle;

  const opts = { type: "application/ld+json" };
  const file = new File([tdStr], "", opts);

  const aDownload = document.getElementById("aDownload");
  aDownload.href = window.URL.createObjectURL(file);
  aDownload.setAttribute("download", filename);
  aDownload.click();
};

/**
 * File Handle from native filesystem api
 * Only JSON/JSON+LD Files are supported
 */
const getReadFileHandle = () => {
  const opts = {
    types: [
      {
        description: "Thing Description",
        accept: { "application/ld+json": [".jsonld", ".json"] },
      },
    ],
  };

  if ("showOpenFilePicker" in window) {
    return window.showOpenFilePicker(opts).then((handles) => handles[0]);
  }

  return window.chooseFileSystemEntries();
};

const getWriteFileHandle = async () => {
  // new file system api
  if ("showSaveFilePicker" in window) {
    const opts = {
      types: [
        {
          description: "Thing Description",
          accept: { "application/ld+json": [".jsonld", ".json"] },
        },
      ],
    };

    return await window.showSaveFilePicker(opts);
  }

  // old html file input
  const opts = {
    type: "save-file",
    accepts: [
      {
        description: "Thing Description",
        extensions: [".jsonld", ".json"],
        mimeTypes: ["application/ld+json"],
      },
    ],
  };

  return await window.chooseFileSystemEntries(opts);
};

export { readFromFile, saveToFile };
