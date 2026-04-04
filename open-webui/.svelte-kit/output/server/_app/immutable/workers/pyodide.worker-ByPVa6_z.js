import { loadPyodide } from "pyodide";
let pyodideReady = null;
async function loadPyodideAndPackages(packages = []) {
  self.stdout = null;
  self.stderr = null;
  self.result = null;
  self.pyodide = await loadPyodide({
    indexURL: "/pyodide/",
    stdout: (text) => {
      if (self.stdout) {
        self.stdout += `${text}
`;
      } else {
        self.stdout = `${text}
`;
      }
    },
    stderr: (text) => {
      if (self.stderr) {
        self.stderr += `${text}
`;
      } else {
        self.stderr = `${text}
`;
      }
    },
    packages: ["micropip"]
  });
  const uploadDir = "/mnt/uploads";
  self.pyodide.FS.mkdirTree(uploadDir);
  self.pyodide.FS.mount(self.pyodide.FS.filesystems.IDBFS, {}, "/mnt");
  await new Promise((resolve) => {
    self.pyodide.FS.syncfs(true, (err) => {
      resolve();
    });
  });
  try {
    self.pyodide.FS.stat(uploadDir);
  } catch {
    self.pyodide.FS.mkdirTree(uploadDir);
  }
  const micropip = self.pyodide.pyimport("micropip");
  await micropip.install(packages);
}
async function ensurePyodide(packages = []) {
  if (!pyodideReady) {
    pyodideReady = loadPyodideAndPackages(packages);
  }
  await pyodideReady;
  if (packages.length > 0 && self.pyodide) {
    const micropip = self.pyodide.pyimport("micropip");
    await micropip.install(packages);
  }
}
function persistFS() {
  if (!self.pyodide) return;
  self.pyodide.FS.syncfs(false, (err) => {
  });
}
function fsUploadFiles(files, dir = "/mnt/uploads") {
  try {
    self.pyodide.FS.stat(dir);
  } catch {
    self.pyodide.FS.mkdirTree(dir);
  }
  for (const file of files) {
    self.pyodide.FS.writeFile(`${dir}/${file.name}`, new Uint8Array(file.data));
  }
}
function fsList(path) {
  const entries = [];
  try {
    const items = self.pyodide.FS.readdir(path).filter((n) => n !== "." && n !== "..");
    for (const name of items) {
      try {
        const stat = self.pyodide.FS.stat(`${path}/${name}`);
        const isDir = self.pyodide.FS.isDir(stat.mode);
        entries.push({
          name,
          type: isDir ? "directory" : "file",
          size: isDir ? 0 : stat.size
        });
      } catch {
      }
    }
  } catch {
  }
  return entries;
}
function fsRead(path) {
  const data = self.pyodide.FS.readFile(path);
  return data.buffer;
}
function fsDelete(path) {
  try {
    const stat = self.pyodide.FS.stat(path);
    if (self.pyodide.FS.isDir(stat.mode)) {
      const items = self.pyodide.FS.readdir(path).filter((n) => n !== "." && n !== "..");
      for (const item of items) {
        fsDelete(`${path}/${item}`);
      }
      self.pyodide.FS.rmdir(path);
    } else {
      self.pyodide.FS.unlink(path);
    }
  } catch {
  }
}
function fsMkdir(path) {
  self.pyodide.FS.mkdirTree(path);
}
async function executeCode(id, code, files) {
  self.stdout = null;
  self.stderr = null;
  self.result = null;
  if (files && files.length > 0) {
    fsUploadFiles(files);
    persistFS();
  }
  try {
    if (code.includes("matplotlib")) {
      await self.pyodide.runPythonAsync(`import base64
import os
from io import BytesIO

# before importing matplotlib
# to avoid the wasm backend (which needs js.document', not available in worker)
os.environ["MPLBACKEND"] = "AGG"

import matplotlib.pyplot

_old_show = matplotlib.pyplot.show
assert _old_show, "matplotlib.pyplot.show"

def show(*, block=None):
	buf = BytesIO()
	matplotlib.pyplot.savefig(buf, format="png")
	buf.seek(0)
	# encode to a base64 str
	img_str = base64.b64encode(buf.read()).decode('utf-8')
	matplotlib.pyplot.clf()
	buf.close()
	print(f"data:image/png;base64,{img_str}")

matplotlib.pyplot.show = show`);
    }
    self.result = await self.pyodide.runPythonAsync(code);
    self.result = processResult(self.result);
    /* @__PURE__ */ console.log("Python result:", self.result);
    persistFS();
  } catch (error) {
    self.stderr = error instanceof Error ? error.message : String(error);
  }
  self.postMessage({ id, result: self.result, stdout: self.stdout, stderr: self.stderr });
}
self.onmessage = async (event) => {
  const data = event.data;
  const { id, type } = data;
  if (!type || type === "execute") {
    const { code, files, ...context } = data;
    for (const key of Object.keys(context)) {
      if (key !== "id" && key !== "type") {
        self[key] = context[key];
      }
    }
    await ensurePyodide(self.packages);
    await executeCode(id, code, files);
    return;
  }
  await ensurePyodide();
  switch (type) {
    case "fs:upload": {
      const { files, dir } = data;
      fsUploadFiles(files, dir);
      persistFS();
      self.postMessage({ id, type: "fs:upload", success: true });
      break;
    }
    case "fs:list": {
      const entries = fsList(data.path);
      self.postMessage({ id, type: "fs:list", entries });
      break;
    }
    case "fs:read": {
      try {
        const buffer = fsRead(data.path);
        self.postMessage({ id, type: "fs:read", data: buffer }, { transfer: [buffer] });
      } catch (err) {
        self.postMessage({
          id,
          type: "fs:read",
          error: err instanceof Error ? err.message : String(err)
        });
      }
      break;
    }
    case "fs:delete": {
      fsDelete(data.path);
      persistFS();
      self.postMessage({ id, type: "fs:delete", success: true });
      break;
    }
    case "fs:mkdir": {
      fsMkdir(data.path);
      persistFS();
      self.postMessage({ id, type: "fs:mkdir", success: true });
      break;
    }
    case "fs:sync": {
      self.pyodide.FS.syncfs(true, (err) => {
        self.postMessage({ id, type: "fs:sync", success: !err });
      });
      break;
    }
    default:
      console.warn("Unknown message type:", type);
  }
};
function processResult(result) {
  try {
    if (result == null) {
      return null;
    }
    if (typeof result === "string" || typeof result === "number" || typeof result === "boolean") {
      return result;
    }
    if (typeof result === "bigint") {
      return result.toString();
    }
    if (Array.isArray(result)) {
      return result.map((item) => processResult(item));
    }
    if (typeof result.toJs === "function") {
      return processResult(result.toJs());
    }
    if (typeof result === "object") {
      const processedObject = {};
      for (const key in result) {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
          processedObject[key] = processResult(result[key]);
        }
      }
      return processedObject;
    }
    return JSON.stringify(result);
  } catch (err) {
    return `[processResult error]: ${err instanceof Error ? err.message : String(err)}`;
  }
}
//# sourceMappingURL=pyodide.worker-ByPVa6_z.js.map
