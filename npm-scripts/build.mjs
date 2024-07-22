import sass from 'sass';
const { compile } = sass;
import fs from 'fs-extra';
const { writeFile } = fs;
import * as pathUtil from 'path';
import * as nodeZip from 'node-zip';

const BUILD_DIR_NAME = "build";
const TEMP_DIR_NAME = "__temp";
const MANIFEST_NAME = "system";

const MANIFEST_NAME_WITH_EXTENSION = `${MANIFEST_NAME}.json`;
const BUILD_DIR_PATH = pathUtil.join(".", BUILD_DIR_NAME);
const TEMP_DIR_PATH = pathUtil.join(".", BUILD_DIR_NAME, TEMP_DIR_NAME);

// Starts the build process. 
build();

/**
 * Starts the build process. 
 * @async
 */
export default async function build() {
  console.log("Commencing build");

  await ensureBuildDir();
  await transpileSass();
  await preBuildClean();
  await copyFilesToBuild();
  await ensureTempDir();
  await zipFilesToTempSync();
  await copyManifestToTemp();
  await postBuildClean();

  console.log("Concluded build");
}

/**
 * Transpiles the SCSS to CSS. 
 * @async
 */
async function transpileSass() {
  console.log("Transpiling css");

  const fileName = "game-system";

  const css = compile(`presentation/style/${fileName}.scss`).css;
  const cssDestPath = `presentation/style/${fileName}.css`;
  console.log(`writing css file at '${cssDestPath}'`);
  await writeFile(cssDestPath, css);

  const buildStyleDir = pathUtil.join(BUILD_DIR_PATH, "presentation/style");
  console.log(`Ensuring css dir '${buildStyleDir}'`);
  await fs.ensureDir(buildStyleDir);
  const buildStyleDest = pathUtil.join(buildStyleDir, `${fileName}.css`);
  
  console.log(`Copying css file '${cssDestPath}' to '${buildStyleDest}'`);
  fs.copySync(cssDestPath, buildStyleDest, false);
}

/**
 * Cleans the build destination directory. 
 * 
 * For use before a new build is made, to ensure the build destination directory is empty. 
 * This avoids packing any unnecessary artifacts. 
 * @async
 */
async function preBuildClean() {
  console.log(`Emptying build dir "${BUILD_DIR_PATH}"`);
  try {
    await fs.emptyDir(BUILD_DIR_PATH);
  } catch (err) {
    console.error(err)
  }
}

/**
 * Cleans out the temporary directory. 
 * @async
 */
async function postBuildClean() {
  console.log(`Finalizing build dir "${BUILD_DIR_PATH}"`);
  const pathsInBuildDir = fs.readdirSync(BUILD_DIR_PATH);
  for (const path of pathsInBuildDir) {
    if (new RegExp(TEMP_DIR_NAME).test(path)) continue;

    const fullPath = pathUtil.join(BUILD_DIR_PATH, path);
    await fs.remove(fullPath);
  }

  const pathsInDistDir = fs.readdirSync(TEMP_DIR_PATH);
  for (const path of pathsInDistDir) {
    const fullPathSrc = pathUtil.join(TEMP_DIR_PATH, path);
    const fullPathDst = pathUtil.join(BUILD_DIR_PATH, path);
    await fs.move(fullPathSrc, fullPathDst);
  }

  await fs.remove(TEMP_DIR_PATH);
}

/**
 * Ensures the build destination directory exists, by creating it, if it doesn't exist. 
 * @async
 */
async function ensureBuildDir() {
  console.log(`Ensuring build dir '${BUILD_DIR_PATH}'`);
  await fs.ensureDir(BUILD_DIR_PATH);
}

/**
 * Ensures the temp directory exists, by creating it, if it doesn't exist. 
 * @async
 */
async function ensureTempDir() {
  console.log(`Ensuring temp dir '${TEMP_DIR_PATH}'`);
  await fs.ensureDir(TEMP_DIR_PATH);
}

/**
 * These file paths will be ignored during copy. 
 * 
 * NOTE: These are **regular expressions**! 
 */
const copyExcludes = [
  "\\.git",
  "\\.vscode",
  "build",
  "dist",
  "-test\\.mjs",
  "-test-base\\.mjs",
  "node_modules",
  ".gitignore",
  ".npmignore",
  "package-lock.json",
  "package.json",
  "workspace.code-workspace",
  "gulpfile.js",
  "npm-scripts",
  "\\.scss",
];

/**
 * Copies all files to be distributed to the build destination directory. 
 * 
 * @param {String | undefined} path 
 * 
 * @async
 */
async function copyFilesToBuild(path = '.') {
  const paths = fs.readdirSync(path);

  for (const _childPath of paths) {
    const childPath = pathUtil.join(path, _childPath);
    if (isExcluded(childPath)) continue;

    if (isDirectory(childPath) === true) {
      // Drill deeper - recurse.
      await copyFilesToBuild(childPath);
    } else {
      // Copy the target file. 
      const destPath = pathUtil.join(BUILD_DIR_PATH, childPath);
      
      console.log(`Copying '${childPath}' to '${destPath}'`);
      
      const dirPath = destPath.substring(0, destPath.length - pathUtil.basename(destPath).length)
      await fs.ensureDir(dirPath);

      fs.copySync(childPath, destPath, false);
    }
  }
}

/**
 * Returns `true`, if the given file system path represents a directory. 
 * 
 * @param {String} path The path to test for whether it is a directory. 
 * 
 * @returns {Boolean} `true`, if the given file system path represents a directory. 
 */
function isDirectory(path) {
  return fs.statSync(path).isDirectory();
}

/**
 * Returns true, if the given path is to be excluded. 
 * @param {String} path A path to test for whether it is to be excluded. 
 * @returns {Boolean} True, if the given path is to be excluded. 
 */
function isExcluded(path) {
  for (const copyExclude of copyExcludes) {
    if (new RegExp(copyExclude).test(path)) return true;
  }
  return false;
}

/**
 * Zips the files to distribute. 
 * @async
 */
async function zipFilesToTempSync() {
  const pathToZip = BUILD_DIR_PATH;
  const zipInstance = new JSZip();

  const paths = fs.readdirSync(pathToZip);
  for (const dstPath of paths) {
    if (new RegExp(TEMP_DIR_NAME).test(dstPath)) continue;
    
    const srcPath = pathUtil.join(pathToZip, dstPath);
    zipRecursively(zipInstance, srcPath, dstPath);
  }

  const data = zipInstance.generate({ base64: false, compression: 'DEFLATE' });
  const fullPathZipDest = pathUtil.join(TEMP_DIR_PATH, `${MANIFEST_NAME}.zip`);
  console.log(`Writing zip to '${fullPathZipDest}'`);
  await fs.writeFile(fullPathZipDest, data, 'binary');
}

/**
 * Recursively zips a given source directory (or file) and maps it to a new, given path in the given zip archive. 
 * @param {*} zip The zip archive reference to use. 
 * @param {String} srcPath The path of the directory or file to include in the zip archive. 
 * @param {String} dstPath The path within the zip archive where the directory or file will be placed. 
 */
function zipRecursively(zip, srcPath, dstPath = undefined) {
  const zipDestPath = dstPath === undefined ? srcPath : dstPath;

  if (isDirectory(srcPath) === true) {
    console.log(`Zipping directory '${srcPath}' to '${zipDestPath}'`);
    
    const srcSubNames = fs.readdirSync(srcPath);
    for (const srcSubName of srcSubNames) {
      const srcSubPath = pathUtil.join(srcPath, srcSubName);
      const dstSubPath = pathUtil.join(dstPath, srcSubName);
      console.log(`Recursing '${srcSubPath}' to '${dstSubPath}'`);
      zipRecursively(zip, srcSubPath, dstSubPath);
    }
  } else {
    console.log(`Zipping file '${srcPath}' to '${zipDestPath}'`);
    zip.file(zipDestPath, fs.readFileSync(srcPath));
  }
}

/**
 * Copies the system manifest file to the temporary directory. 
 * @async
 */
async function copyManifestToTemp() {
  const srcManifest = pathUtil.join(BUILD_DIR_PATH, MANIFEST_NAME_WITH_EXTENSION);
  const dstManifest = pathUtil.join(TEMP_DIR_PATH, MANIFEST_NAME_WITH_EXTENSION);
  
  console.log(`Copying manifest from '${srcManifest}' to '${dstManifest}'`);

  await fs.copy(srcManifest, dstManifest);
}
