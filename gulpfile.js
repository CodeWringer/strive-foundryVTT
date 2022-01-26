const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const fs = require('fs-extra');
const pathUtil = require('path');

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
const BUILD_DIR_NAME = pathUtil.join(".", "build");

async function cleanBuildDir() {
  console.log(`Emptying build dir "${BUILD_DIR_NAME}"`);
  try {
    await fs.emptyDir(BUILD_DIR_NAME);
  } catch (err) {
    console.error(err)
  }
  return Promise.resolve();
}

const copyExcludes = [
  ".git",
  "build",
  "scss",
  "node_modules",
  ".gitignore",
  ".npmignore",
  "package-lock.json",
  "package.json",
  "workspace.code-workspace",
  "gulpfile.js"
];
async function copyFiles() {
  return new Promise(resolve => {
    const paths = fs.readdirSync('./');
  
    for (const path of paths) {
      if (isExcluded(path)) continue;

      const destPath = pathUtil.join(".", BUILD_DIR_NAME, path);
      console.log(`Copying '${path}' to '${destPath}'`);
      fs.copySync(path, destPath, false);
    }
    resolve();
  });
}

function isExcluded(path) {
  for (const copyExclude of copyExcludes) {
    // if (path.startsWith(copyExclude)) return true;
    if (new RegExp(copyExclude).test(path)) return true;
  }
  return false;
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
  cleanBuildDir,
  copyFiles
);
exports.css = css;
