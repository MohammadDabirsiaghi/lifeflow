import { readFileSync } from 'node:fs';
import { EleventyRenderPlugin } from "@11ty/eleventy";
import { join } from 'node:path';
import { sync } from 'glob';
import { appFilters } from "./shared/e11ty/filters.mjs";
import { appData } from "./shared/e11ty/data.mjs"
import path from "path";
import { fileURLToPath } from "url";
import dynamicAssets from "./shared1/includes/dynamic-asset-manager.js";
import  fs  from "fs";
const buildVersion = Date.now().toString();
const isGitHubPages = process.env.DEPLOY_TARGET === "github";

/** @type {import('@11ty/eleventy').LocalConfig} */
export default function (eleventyConfig) {

	  // هیچ فایلی از lib نباید به‌عنوان template پردازش شود
  eleventyConfig.ignores.add("src/assets/lib/**");

  // تغییرات lib هم نباید باعث rebuild/watch الونتی شود
  eleventyConfig.watchIgnores.add("src/assets/lib/**");

	const environment = process.env.NODE_ENV || "production";
	  const pathPrefix = isGitHubPages ? "/gadget-store/" : "/";

  dynamicAssets.setPathPrefix(pathPrefix);


	eleventyConfig.on("eleventy.before", () => {
    dynamicAssets.clearAll();
  });

  eleventyConfig.addGlobalData("buildVersion", () => {
    return buildVersion;
  });

// 	// فیلتر برای چاپ متغیرها در ترمینال VS Code
//   eleventyConfig.addFilter("terminalLog", function(value) {
//     console.log("=== ELEVENTY DEBUG START ===");
//     console.log(value);
//     console.log("=== ELEVENTY DEBUG END ===");
//     return ""; // چیزی در HTML چاپ نمی‌کند، فقط در ترمینال نشان می‌دهد
//   });

//   // فیلتر برای تبدیل آبجکت‌ها به رشته قابل خواندن در مرورگر
//   eleventyConfig.addFilter("json", function(value) {
//     return JSON.stringify(value, null, 2);
//   });

eleventyConfig.path

	eleventyConfig.setInputDirectory("src");
	eleventyConfig.setOutputDirectory("dist");

	eleventyConfig.setLayoutsDirectory("layouts");
	eleventyConfig.setIncludesDirectory("includes");
	eleventyConfig.setDataDirectory("data");

	
	

  eleventyConfig.addPassthroughCopy({
    "src/assets": "assets",
  });
    eleventyConfig.addPassthroughCopy({
    "src/static": "static",
  });
    // حالت توسعه (Dev): همه چیز از جمله کتابخانه‌های خام کپی می‌شوند

  

	appFilters(eleventyConfig);
	appData(eleventyConfig);





  eleventyConfig.addShortcode("addCss", function (filePath, layer = "Page") {
    return dynamicAssets.addCss(this.page, filePath, layer);
  });

  eleventyConfig.addShortcode(
    "addJs",
    function (
      filePath,
      zone = "scripts",
      layer = "Page",
      type = "classic",
      loading = "normal"
    ) {
      return dynamicAssets.addJs(
        this.page,
        filePath,
        zone,
        layer,
        type,
        loading
      );
    }
  );

  eleventyConfig.addShortcode(
    "renderCss",
    function (layer,version = buildVersion) {
      return dynamicAssets.renderCss(this.page, layer, version);
    }
  );

  eleventyConfig.addShortcode(
    "renderScripts",
    function (zone, layer, version = buildVersion) {
      return dynamicAssets.renderScripts(
        this.page,
        zone,
        layer,
        version
      );
    }
  );

  eleventyConfig.addShortcode(
    "renderAssets",
    function (zone, layer,version = buildVersion) {
      return dynamicAssets.renderAssets(
        this.page,
        zone,
        layer,
        version
      );
    }
  );

  eleventyConfig.on("eleventy.after", async () => {
    await dynamicAssets.buildAll({
      outputDir: "dist"
    });
	 const checkPath = "./dist/assets/js";
    if (fs.existsSync(checkPath)) {
      console.log("✅ پوشه JS در مقصد ساخته شده است.");
    } else {
      console.error("❌ خطا: پوشه JS در مقصد یافت نشد!");
    }
  });







	/**
	 * Filters
	 */
	eleventyConfig.addFilter("miliseconds_to_minutes", function (value) {
		// Raturn 3:45 time format
		const minutes = Math.floor(value / 60000);
		const seconds = ((value % 60000) / 1000).toFixed(0);
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
	});

	eleventyConfig.addFilter("relative", (page) => {
		const segments = (page.url || '').replace(/^\//).split('/');
		if (segments.length === 1) {
			return '.';
		} else {
			return '../'.repeat(segments.length - 1).slice(0, -1);
		}
	});

	eleventyConfig.addFilter("contains", (items, item) => {
		return items && Array.isArray(items) && items.includes(item);
	});

	eleventyConfig.addFilter("concat_objects", function (object, object2) {
		if (
			object &&
			object2 &&
			typeof object === 'object' &&
			typeof object2 === 'object' &&
			!Array.isArray(object) &&
			!Array.isArray(object2)
		) {
			return { ...object, ...object2 };
		}
		return object;
	});

	eleventyConfig.addFilter("replace_regex", function (input, regStr, replStr) {
		const regex = new RegExp(regStr, 'gm');
		return input.replace(regex, replStr);
	});

	eleventyConfig.addFilter("timestamp_to_date", function (timestamp) {
		const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
		return date.toISOString().split('T')[0]; // Extract the date in 'YYYY-MM-DD' format
	});

	eleventyConfig.addFilter("split_to_n", function (arr, n) {
		const chunkSize = Math.round(arr.length / n);
		const result = [];
		for (let i = 0; i < arr.length; i += chunkSize) {
			result.push(arr.slice(i, i + chunkSize));
		}
		return result;
	})

	eleventyConfig.addFilter("format_number", function (value) {
		return value.toString()
			.split('')
			.reverse()
			.reduce((acc, char, index) => {
				if (index > 0 && index % 3 === 0) {
					acc.push(',');
				}
				acc.push(char);
				return acc;
			}, [])
			.reverse()
			.join('');
	});

	function randomNumber(x, min = 0, max = 100, round = 0) {
		let value = ((x * x * Math.PI * Math.E * (max + 1) * (Math.sin(x) / Math.cos(x * x))) % (max + 1 - min)) + min;

		value = value > max ? max : value;
		value = value < min ? min : value;

		if (round !== 0) {
			value = parseFloat(value.toFixed(round));
		} else {
			value = Math.floor(value);
		}

		return value;
	}

	eleventyConfig.addFilter("random_date_ago", function (x, daysAgo = 100) {
		const today = new Date();
		const randomDaysAgo = randomNumber(x, 0, daysAgo);
		today.setDate(today.getDate() - randomDaysAgo);
		return today;
	});

	eleventyConfig.addFilter("random_date", function (x, startDate = null, endDate = null) {
		const start = new Date(startDate ? startDate : '2024-01-01').getTime() / 1000;
		const end = new Date(endDate ? endDate : '2024-12-30').getTime() / 1000;

		const randomTimestamp = randomNumber(x, start, end);
		return new Date(randomTimestamp * 1000);
	});

	eleventyConfig.addFilter("random_item", function (x, items) {
		const index = randomNumber(x, 0, items.length - 1);
		return items[index];
	});

	eleventyConfig.addFilter("random_number", randomNumber);

	eleventyConfig.addFilter("first_letters", function capitalizeFirstLetter(string) {
		return string.split(' ').map(word => word.charAt(0)).join('');
	})

	eleventyConfig.addFilter("uc_first", function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	})

	eleventyConfig.addFilter("size", function (elem) {
		if (elem instanceof Object) {
			return Object.keys(elem).length;
		}

		return elem.length;
	})

	eleventyConfig.addFilter("first", function (elem) {
		if (elem instanceof Object) {
			return elem[Object.keys(elem)[0]];
		}

		return elem[0];
	})

	// time ago from today
	eleventyConfig.addFilter("timeago", function (date) {
		const seconds = Math.floor((new Date() - date) / 1000);

		let interval = Math.floor(seconds / 31536000);

		if (interval > 1) {
			return interval + " years ago";
		}
		interval = Math.floor(seconds / 2592000);
		if (interval > 1) {
			return interval + " months ago";
		}
		interval = Math.floor(seconds / 86400);
		if (interval > 1) {
			return interval + " days ago";
		}
		interval = Math.floor(seconds / 3600);
		if (interval > 1) {
			return interval + " hours ago";
		}
		interval = Math.floor(seconds / 60);
		if (interval > 1) {
			return interval + " minutes ago";
		}
		if (seconds > 0) {
			return Math.floor(seconds) + " seconds ago";
		}

		return "now";
	})

	/**
	 * Shortcodes
	 */
	const tags = ["highlight", "endhighlight"];
	tags.forEach(tag => {
		eleventyConfig.addLiquidTag(tag, function (liquidEngine) {
			return {
				parse: function (tagToken, remainingTokens) {
					this.str = tagToken.args;
				},
				render: function (scope, hash) {
					return "";
				},
			};
		});
	});

	let _CAPTURES = {};

	eleventyConfig.on('beforeBuild', () => {
		_CAPTURES = {};
	});

	['style','script_body','script_head','script', 'modal'].forEach((tag) => {
		eleventyConfig.addPairedShortcode(`capture_${tag}`, function (content, inline) {
			if (inline) {
				return content;
			}

			if (!_CAPTURES[tag]) {
				_CAPTURES[tag] = []
			}
			
			if (!_CAPTURES[tag][this.page.inputPath]) {
				_CAPTURES[tag][this.page.inputPath] = [];
			}

			_CAPTURES[tag][this.page.inputPath].push(content);

			return ''
		})

		eleventyConfig.addShortcode(`${tag}s`, function () {
			if (_CAPTURES[tag] && _CAPTURES[tag][this.page.inputPath]) {
				return _CAPTURES[tag][this.page.inputPath] ? `<!-- BEGIN PAGE ${tag.toUpperCase()}S -->\n${_CAPTURES[tag][this.page.inputPath].join('\n').trim()}\n<!-- END PAGE ${tag.toUpperCase()}S -->` : '';
			}

			return ''
		});
	});

	  return {
pathPrefix,
  };
}