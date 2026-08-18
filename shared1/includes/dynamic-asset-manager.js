// config/dynamic-asset-manager.js

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const sass = require("sass");
const { rollup } = require("rollup");

function getDefault(mod) {
  return mod && mod.default ? mod.default : mod;
}

const resolvePlugin = getDefault(require("@rollup/plugin-node-resolve"));
const commonjsPlugin = getDefault(require("@rollup/plugin-commonjs"));
const terserPlugin = getDefault(require("@rollup/plugin-terser"));

class DynamicAssetManager {
  constructor() {
     this.pathPrefix = "/";
    this.pages = new Map();
  }
  setPathPrefix(pathPrefix = "/") {
    this.pathPrefix = pathPrefix || "/";
  }
  clearAll() {
    this.pages.clear();
  }

  isPublish() {
//console.log(process.env);

    return (
      process.env.ELEVENTY_ENV === "development" ||
      process.env.NODE_ENV !== "development"
    );
  }

  normalizeLayer(layer = "Page") {
    return String(layer || "Page").trim();
  }

  normalizeZone(zone = "scripts") {
    return String(zone || "scripts").trim();
  }

  normalizeType(type = "module") {
    type = String(type || "module").trim().toLowerCase();

    if (!["module", "classic"].includes(type)) {
      return "module";
    }

    return type;
  }

  normalizeLoading(loading = "normal") {
    loading = String(loading || "normal").trim().toLowerCase();

    if (!["normal", "defer", "async"].includes(loading)) {
      return "normal";
    }

    return loading;
  }

  getPageKey(page) {
    const raw = page?.url || page?.filePathStem || "unknown-page";

    return (
      String(raw)
        .replace(/^\/+/, "")
        .replace(/\/+$/, "")
        .replace(/[^\w\-\/]/g, "-") || "index"
    );
  }

  getPageRecord(page) {
    const pageKey = this.getPageKey(page);

    if (!this.pages.has(pageKey)) {
      this.pages.set(pageKey, {
        key: pageKey,
        css: {},
        js: {},
        rendered: new Set()
      });
    }

    return this.pages.get(pageKey);
  }

  ensureCssLayer(record, layer) {
    if (!record.css[layer]) {
      record.css[layer] = new Set();
    }
  }

  ensureJsGroup(record, zone, layer, type, loading) {
    if (!record.js[zone]) {
      record.js[zone] = {};
    }

    if (!record.js[zone][layer]) {
      record.js[zone][layer] = {};
    }

    if (!record.js[zone][layer][type]) {
      record.js[zone][layer][type] = {};
    }

    if (!record.js[zone][layer][type][loading]) {
      record.js[zone][layer][type][loading] = new Set();
    }
  }

  addCss(page, filePath, layer = "Page") {
    if (!filePath) return "";

    const record = this.getPageRecord(page);
    layer = this.normalizeLayer(layer);

    this.ensureCssLayer(record, layer);

    record.css[layer].add(this.normalizeFilePath(filePath));

    return "";
  }

  addJs(
    page,
    filePath,
    zone = "scripts",
    layer = "Page",
    type = "module",
    loading = "normal"
  ) {
    if (!filePath) return "";

    const record = this.getPageRecord(page);

    zone = this.normalizeZone(zone);
    layer = this.normalizeLayer(layer);
    type = this.normalizeType(type);
    loading = this.normalizeLoading(loading);

    /**
     * نکته:
     * برای type="module"، defer عملاً لازم نیست.
     * module scriptها ذاتاً defer-like هستند.
     */
    if (type === "module" && loading === "defer") {
      loading = "normal";
    }

    this.ensureJsGroup(record, zone, layer, type, loading);

    record.js[zone][layer][type][loading].add(this.normalizeFilePath(filePath));

    return "";
  }

  normalizeFilePath(filePath) {
    return String(filePath).replace(/\\/g, "/");
  }

  appendVersion(url, buildVersion = "") {
    if (!buildVersion) return url;

    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}v=${buildVersion}`;
  }

  toDevCssUrl(filePath) {
    /**
     * src/assets/scss/components/product-gallery.scss
     * =>
     * /assets/dev/css/components/product-gallery.css
     */
    return filePath
      .replace(/^src\/assets\/scss\//, "/assets/dev/css/")
      .replace(/\.scss$/, ".css");
  }

  toDevJsUrl(filePath) {
    /**
     * src/assets/js/components/product-gallery.js
     * =>
     * /assets/dev/js/components/product-gallery.js
     */
    return filePath.replace(/^src\/assets\/js\//, "/assets/dev/js/");
  }

  getBundleCssUrl(record, layer) {
    const cleanLayer = String(layer).toLowerCase();

    return `/assets/bundles/${record.key}/${cleanLayer}.bundle.css`;
  }

  getBundleJsUrl(record, zone, layer, type, loading) {
    const cleanZone = String(zone).toLowerCase();
    const cleanLayer = String(layer).toLowerCase();
    const cleanType = String(type).toLowerCase();
    const cleanLoading = String(loading).toLowerCase();

    return `/assets/bundles/${record.key}/${cleanZone}.${cleanLayer}.${cleanType}.${cleanLoading}.bundle.js`;
  }

  renderScriptTag(src, type = "classic", loading = "normal") {
    const attrs = [];

    if (type === "module") {
      attrs.push(`type="module"`);
    }

    if (type === "classic" && loading === "defer") {
      attrs.push("defer");
    }

    if (loading === "async") {
      attrs.push("async");
    }

    const attrText = attrs.length ? ` ${attrs.join(" ")}` : "";

    return `<script src="${src}"${attrText}></script>`;
  }

  renderCss(page, layer, buildVersion = "") {
    const record = this.getPageRecord(page);
    layer = this.normalizeLayer(layer);

const files = record.css[layer] || []; // اطمینان از وجود آرایه یا ست

    if (!files || files.size === 0) {
      return "";
    }

    const renderKey = `css:${layer}`;

    if (record.rendered.has(renderKey)) {
      return "";
    }

    record.rendered.add(renderKey);

    if (this.isPublish()) {
      const url = this.appendVersion(
        this.getBundleCssUrl(record, layer),
        buildVersion
      );

      return `<link rel="stylesheet" href="${url}">`;
    }

    return [...files]
      .map((file) => {

 const href = this.buildCssHref({ file, page,buildVersion });
       //return ` <link href="{% if url contains 'http://' or url contains 'https://' %}{{ file }}{% else %}{{ page | relative }}/dist/libs/{{ lib[1].npm }}/{{ file }}{% if environment != 'development %}?{{ 'now' | date: '%s' }}{% endif %}{% endif %}" rel="stylesheet"/>`;

         return `<link rel="stylesheet" href="${href }">`;
      })
      .join("\n");
  }
buildCssHref({ file, page, buildVersion }) {
  // 1. بررسی لینک‌های خارجی (CDN)
  const isExternal = /^(https?:)?\/\//i.test(file);
  if (isExternal) {
    return file;
  }

  let finalPath = file;

  // 2. اگر فایل Sass است، آدرس آن را به نسخه کامپایل شده در dist تغییر بده
  if (/\.(scss|sass)$/i.test(file)) {
    // حذف بخش src/assets/ و تبدیل آن به /assets/css/
    // اینطوری چه در scss/ باشد چه در admin/، مسیر خروجی تمیز می‌شود
    const normalizedRelative = file
      .replace(/^src[\\/]assets[\\/]/i, "") // حذف بخش src/assets/
      .replace(/\.(scss|sass)$/i, ".css")   // تبدیل پسوند
      .replace(/\\/g, "/");                 // اصلاح جداکننده ویندوز

    finalPath = `${normalizedRelative}`;
  }

  // 3. اضافه کردن PathPrefix و Version
  const normalized = finalPath.startsWith("/") ? finalPath : `/${finalPath}`;
  const prefix = this.pathPrefix && this.pathPrefix !== "/"
      ? this.pathPrefix.replace(/\/$/, "")
      : "";

  return this.appendVersion(`${prefix}${normalized}`, buildVersion);
}
buildJsSrc({ file, buildVersion }) {
  const isExternal = /^(https?:)?\/\//i.test(file);
  if (isExternal) {
    return file;
  }

  let finalPath = file.replace(/\\/g, "/");

  // اگر فایل از src/assets آمده، فقط src/ حذف شود
  // src/assets/admin/js/app.js -> /assets/admin/js/app.js
  if (/^src\/assets\//i.test(finalPath)) {
    finalPath = finalPath.replace(/^src\//i, "");
  }

  const normalized = finalPath.startsWith("/") ? finalPath : `/${finalPath}`;
  const prefix =
    this.pathPrefix && this.pathPrefix !== "/"
      ? this.pathPrefix.replace(/\/$/, "")
      : "";

  return this.appendVersion(`${prefix}${normalized}`, buildVersion);
}

 getRelativePath(page) {
  const url = page?.url || "/";
  const segments = url
    .replace(/^\/|\/$/g, "")
    .split("/")
    .filter(Boolean);

  if (segments.length === 0) {
    return ".";
  }

  return "../".repeat(segments.length).replace(/\/$/, "");
}
  renderScripts(page, zone, layer, buildVersion = "") {
    const record = this.getPageRecord(page);

    zone = this.normalizeZone(zone);
    layer = this.normalizeLayer(layer);

    const layerGroups = record.js[zone]?.[layer];

    if (!layerGroups) {
      return "";
    }

    const renderKey = `js:${zone}:${layer}`;

    if (record.rendered.has(renderKey)) {
      return "";
    }

    record.rendered.add(renderKey);

    const tags = [];

    const orderedGroups = this.getOrderedJsGroups(layerGroups);

    for (const group of orderedGroups) {
      const { type, loading, files } = group;

      if (!files || files.size === 0) continue;

      if (this.isPublish()) {
        const url = this.appendVersion(
          this.getBundleJsUrl(record, zone, layer, type, loading),
          buildVersion
        );

        tags.push(this.renderScriptTag(url, type, loading));
      } else {
        for (const file of files) {
           const src = this.buildJsSrc({ file, buildVersion });
          //const url = this.appendVersion(this.toDevJsUrl(file), buildVersion);
          tags.push(this.renderScriptTag(src, type, loading));
        }
      }
    }

    return tags.join("\n");
  }

  renderAssets(page, zone, layer, buildVersion = "") {
    if (zone === "stylesheets") {
      return this.renderCss(page, layer, buildVersion);
    }

    return this.renderScripts(page, zone, layer, buildVersion);
  }

  getOrderedJsGroups(layerGroups) {
    const result = [];

    const order = [
      ["classic", "normal"],
      ["classic", "defer"],
      ["module", "normal"],
      ["classic", "async"],
      ["module", "async"]
    ];

    for (const [type, loading] of order) {
      const files = layerGroups?.[type]?.[loading];

      if (files && files.size > 0) {
        result.push({
          type,
          loading,
          files
        });
      }
    }

    return result;
  }

  ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
  }

  makeTempEntryName(recordKey, zone, layer, ext, type = "", loading = "") {
    const hash = crypto
      .createHash("md5")
      .update(`${recordKey}:${zone}:${layer}:${type}:${loading}:${ext}`)
      .digest("hex")
      .slice(0, 8);

    const cleanRecord = recordKey.replace(/\//g, "_");

    return `.tmp-assets/${cleanRecord}-${zone}-${layer}-${type}-${loading}-${hash}.${ext}`;
  }

writeScssEntry(files, recordKey, layer) {
  const tempFile = this.makeTempEntryName(
    recordKey,
    "stylesheets",
    layer,
    "scss"
  );

  this.ensureDir(path.dirname(tempFile));

  const tempDir = path.dirname(path.resolve(tempFile));

  const content = [...files]
    .map((file) => {
      const abs = path.resolve(file);

      if (!fs.existsSync(abs)) {
        throw new Error(
          `[DynamicAssetManager] SCSS file not found: ${file}\nResolved path: ${abs}`
        );
      }

      let relative = path.relative(tempDir, abs).replace(/\\/g, "/");

      if (!relative.startsWith(".")) {
        relative = `./${relative}`;
      }

      return `@use "${relative}";`;
    })
    .join("\n");

  fs.writeFileSync(tempFile, content, "utf8");

  return tempFile;
}


writeJsEntry(files, recordKey, zone, layer, type, loading) {
  const tempFile = this.makeTempEntryName(
    recordKey,
    zone,
    layer,
    "js",
    type,
    loading
  );

  this.ensureDir(path.dirname(tempFile));

  const tempDir = path.dirname(path.resolve(tempFile));

  const content = [...files]
    .map((file) => {
      const abs = path.resolve(file);

      if (!fs.existsSync(abs)) {
        throw new Error(
          `[DynamicAssetManager] JS file not found: ${file}\nResolved path: ${abs}`
        );
      }

      let relative = path.relative(tempDir, abs).replace(/\\/g, "/");

      if (!relative.startsWith(".")) {
        relative = `./${relative}`;
      }

      return `import "${relative}";`;
    })
    .join("\n");

  fs.writeFileSync(tempFile, content, "utf8");

  return tempFile;
}

  async buildAll({ outputDir = "_site" } = {}) {
    if (this.isPublish()) {
      await this.buildPublishBundles(outputDir);
    } else {
      await this.buildDevAssets(outputDir);
    }
  }

  async buildPublishBundles(outputDir) {
    for (const record of this.pages.values()) {
      await this.buildPublishCss(record, outputDir);
      await this.buildPublishJs(record, outputDir);
    }
  }

  async buildPublishCss(record, outputDir) {
    for (const [layer, files] of Object.entries(record.css)) {
      if (!files || files.size === 0) continue;

      const entryFile = this.writeScssEntry(files, record.key, layer);

      const result = sass.compile(entryFile, {
        style: "compressed",
        sourceMap: false,
        loadPaths: ["src/assets/scss", "node_modules"]
      });

      const outDir = path.join(outputDir, "assets", "bundles", record.key);
      this.ensureDir(outDir);

      const outFile = path.join(
        outDir,
        `${String(layer).toLowerCase()}.bundle.css`
      );

      fs.writeFileSync(outFile, result.css, "utf8");
    }
  }

  async buildPublishJs(record, outputDir) {
    for (const [zone, layers] of Object.entries(record.js)) {
      for (const [layer, typeGroups] of Object.entries(layers)) {
        for (const [type, loadingGroups] of Object.entries(typeGroups)) {
          for (const [loading, files] of Object.entries(loadingGroups)) {
            if (!files || files.size === 0) continue;

            const entryFile = this.writeJsEntry(
              files,
              record.key,
              zone,
              layer,
              type,
              loading
            );

            const bundle = await rollup({
              input: entryFile,
              plugins: [
                resolvePlugin(),
                commonjsPlugin(),
                terserPlugin()
              ]
            });

            const outDir = path.join(outputDir, "assets", "bundles", record.key);
            this.ensureDir(outDir);

            const fileName = `${String(zone).toLowerCase()}.${String(
              layer
            ).toLowerCase()}.${String(type).toLowerCase()}.${String(
              loading
            ).toLowerCase()}.bundle.js`;

            const outFile = path.join(outDir, fileName);

            await bundle.write({
              file: outFile,
              format: type === "module" ? "esm" : "iife",
              sourcemap: false,
              name: `Bundle_${this.safeJsName(record.key)}_${this.safeJsName(
                zone
              )}_${this.safeJsName(layer)}_${this.safeJsName(type)}_${this.safeJsName(
                loading
              )}`
            });

            await bundle.close();
          }
        }
      }
    }
  }

  safeJsName(value) {
    return String(value).replace(/[^\w$]/g, "_");
  }

  async buildDevAssets(outputDir) {
    for (const record of this.pages.values()) {
      await this.buildDevCss(record, outputDir);
      //await this.buildDevJs(record, outputDir);
    }
  }

 async buildDevCss(record, outputDir) {
  for (const files of Object.values(record.css ?? {})) {
    for (const file of files) {
      const cleanFile = file.replace(/[?#].*$/, "");

      // فقط اگر فایل Sass محلی باشد پردازشش کن
      if (!/\.(scss|sass)$/i.test(cleanFile) || /^(https?:)?\/\//i.test(cleanFile)) {
        continue;
      }

         // --- اصلاح مسیر اینجا انجام می‌شود ---
      // ۱. حذف اسلش ابتدایی (اگر وجود دارد) تا مسیر نسبی شود
      const relativePath = cleanFile.startsWith('/') ? cleanFile.slice(1) : cleanFile;
      
      // ۲. ترکیب با مسیر جاری پروژه
      //const absoluteFile = path.join(process.cwd(), relativePath);

      // (اختیاری) اگر فایل هنوز پیدا نشد، شاید باید 'src/' را به ابتدای آن اضافه کنی
      // اگر فایل‌هایت حتماً داخل 'src' هستند و مسیرهای داده شده شامل src نیستند:
       const absoluteFile = path.join(process.cwd(), 'dist', relativePath);

      if (!fs.existsSync(absoluteFile)) {
        console.warn(`[DynamicAssets] Skipping missing file: ${absoluteFile}`);
        continue;
      }

      const result = sass.compile(absoluteFile, {
        style: "expanded",
        sourceMap: true,
        loadPaths: [
          path.resolve("src/assets/scss"),
          path.resolve("node_modules")
        ]
      });
// محاسبه مسیر خروجی (با استفاده از مسیر واقعی فایل)
      const relative = path
        .relative(path.resolve("src/assets/scss"), absoluteFile)
        .replace(/\.(scss|sass)$/i, ".css");

      const outFile = path.join(outputDir, "assets", "css", relative);

      this.ensureDir(path.dirname(outFile));
      fs.writeFileSync(outFile, result.css, "utf8");

      if (result.sourceMap) {
        fs.writeFileSync(`${outFile}.map`, JSON.stringify(result.sourceMap), "utf8");
      }
    }
  }
}


  async buildDevJs(record, outputDir) {
    const allJsFiles = new Set();

    for (const zones of Object.values(record.js)) {
      for (const layers of Object.values(zones)) {
        for (const types of Object.values(layers)) {
          for (const files of Object.values(types)) {
            for (const file of files) {
              allJsFiles.add(file);
            }
          }
        }
      }
    }

    for (const file of allJsFiles) {
      const relative = file.replace(/^src\/assets\/js\//, "");
      const outFile = path.join(outputDir, "assets", "dev", "js", relative);

      this.ensureDir(path.dirname(outFile));

      fs.copyFileSync(file, outFile);
    }
  }
}

module.exports = new DynamicAssetManager();
