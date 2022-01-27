const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const fs = require('fs-extra');
const pathUtil = require('path');
require('node-zip');

/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

// Small error handler helper function.
function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

const SYSTEM_SCSS = ["scss/**/*.scss"];
function compileScss() {
  // Configure options for sass output. For example, 'expanded' or 'nested'
  let options = {
    outputStyle: 'expanded'
  };
  return gulp.src(SYSTEM_SCSS)
    .pipe(
      sass(options)
        .on('error', handleError)
    )
    .pipe(prefix({
      cascade: false
    }))
    .pipe(gulp.dest("./css"))
}
const css = gulp.series(compileScss);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch(SYSTEM_SCSS, css);
}

/* ----------------------------------------- */
/*  Build
/* ----------------------------------------- */
const BUILD_DIR_NAME = "build";
const TEMP_DIR_NAME = "__temp";
const MANIFEST_NAME = "system";

const MANIFEST_NAME_WITH_EXTENSION = `${MANIFEST_NAME}.json`;
const BUILD_DIR_PATH = pathUtil.join(".", BUILD_DIR_NAME);
const TEMP_DIR_PATH = pathUtil.join(".", BUILD_DIR_NAME, TEMP_DIR_NAME);

async function cleanBuildDir() {
  console.log(`Emptying build dir "${BUILD_DIR_PATH}"`);
  try {
    await fs.emptyDir(BUILD_DIR_PATH);
  } catch (err) {
    console.error(err)
  }
  return Promise.resolve();
}

async function cleanBuildDirAfterwards() {
  console.log(`Finalizing build dir "${BUILD_DIR_PATH}"`);
  return new Promise(async (resolve, reject) => {
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

    resolve();
  });
}

async function ensureBuildDir() {
  console.log(`Ensuring build dir '${BUILD_DIR_PATH}'`);
  await fs.ensureDir(BUILD_DIR_PATH);
}

async function ensureTempDir() {
  console.log(`Ensuring temp dir '${TEMP_DIR_PATH}'`);
  await fs.ensureDir(TEMP_DIR_PATH);
}

const copyExcludes = [
  ".git",
  "build",
  "dist",
  "scss",
  "node_modules",
  ".gitignore",
  ".npmignore",
  "package-lock.json",
  "package.json",
  "workspace.code-workspace",
  "gulpfile.js"
];
async function copyFilesToBuild() {
  return new Promise((resolve, reject) => {
    const paths = fs.readdirSync('./');
  
    for (const path of paths) {
      if (isExcluded(path)) continue;

      const destPath = pathUtil.join(BUILD_DIR_PATH, path);
      console.log(`Copying '${path}' to '${destPath}'`);
      fs.copySync(path, destPath, false);
    }
    resolve();
  });
}

function isExcluded(path) {
  for (const copyExclude of copyExcludes) {
    if (new RegExp(copyExclude).test(path)) return true;
  }
  return false;
}

function zipFilesToTempSync() {
  return new Promise(resolve => {
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
    fs.writeFileSync(fullPathZipDest, data, 'binary');

    resolve();
  });
}

function zipRecursively(zip, srcPath, dstPath = undefined) {
  const zipDestPath = dstPath === undefined ? srcPath : dstPath;

  if (fs.statSync(srcPath).isDirectory()) {
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

async function copyManifestToTemp() {
  const srcManifest = pathUtil.join(BUILD_DIR_PATH, MANIFEST_NAME_WITH_EXTENSION);
  const dstManifest = pathUtil.join(TEMP_DIR_PATH, MANIFEST_NAME_WITH_EXTENSION);
  console.log(`Copying manifest from '${srcManifest}' to '${dstManifest}'`);
  await fs.copy(srcManifest, dstManifest);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(
  compileScss,
  watchUpdates
);
exports.build = gulp.series(
  compileScss,
  ensureBuildDir,
  cleanBuildDir,
  copyFilesToBuild,
  ensureTempDir,
  zipFilesToTempSync,
  copyManifestToTemp,
  cleanBuildDirAfterwards
);
exports.css = css;
