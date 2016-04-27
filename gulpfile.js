//'use strict';

/*
1) Should execute 'npm run prepare' before the very first run, it will install and symlink all dependencies.
2) Choose between production 'npm start' and development 'npm run start-dev' modes (watcher will run immediately after initial run).
*/
/*
// Define dependencies
const   env = process.env.NODE_ENV,
		gulp = require('gulp'),
		cache = require('gulp-cache'),
		clean = require('gulp-rimraf'),
		stream = require('event-stream'),
//		browserSync = require('browser-sync'),
//		browserify = require('browserify'),
		babelify = require('babelify'),
		uglify = require('gulp-uglify'),
		source = require('vinyl-source-stream'),
		size = require('gulp-size'),
		jshint = require('gulp-jshint'),
		concat = require('gulp-concat'),
		minifyCSS = require('gulp-minify-css'),
		base64 = require('gulp-base64'),
		imagemin = require('gulp-imagemin'),
		less = require('gulp-less'),
		jade = require('gulp-jade'),
		rename = require('gulp-rename'),
		notify = require("gulp-notify"),
		pluginAutoprefix = require('less-plugin-autoprefix');

const autoprefix = new pluginAutoprefix({ browsers: ["iOS >= 7", "Chrome >= 30", "Explorer >= 9", "last 2 Edge versions", "Firefox >= 20"] });
*/

var gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    typescript = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    tscConfig = require('./tsconfig.json');

const dirs = {
      appDst: 'app/dev/',
      assDst: 'app/dev/assets/',
      appSrc: 'src/'
};

gulp.task('libsetup', function() {
  return gulp
    .src([
      'node_modules/es6-shim/es6-shim.min.js',
      'node_modules/systemjs/dist/system-polyfills.js',
      'node_modules/angular2/es6/dev/src/testing/shims_for_IE.js',
      'node_modules/angular2/bundles/angular2-polyfills.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/rxjs/bundles/Rx.js',
      'node_modules/angular2/bundles/angular2.dev.js'
    ])
    .pipe(gulp.dest(dirs.assDst + 'js/lib/ang2'));
});

// gulp.task('html', function() {
//   gulp.src(dirs.appDst + '**/*.html');
// });

gulp.task('html.dev', function() {                    //TODO: add minimizing
  gulp.src(dirs.appSrc + 'html/**/*.html')
      .pipe(gulp.dest(dirs.appDst));
});

gulp.task('styles', function() {
  gulp.src(dirs.appSrc + 'scss/**/*.scss');                       //TODO: add sass processing, linting, minimizing, uglyfying
});


// Concat and minify styles
// Compile *.less-files to css
// Convert small images to base64, minify css
gulp.task('styles', () => {
	return gulp.src('less/style.less')
		.pipe(less({
			plugins: [autoprefix]
		}))
		.on("error", notify.onError({
			message: 'LESS compile error: <%= error.message %>'
		}))
		.pipe(base64({
			extensions: ['jpg', 'png', 'svg'],
			maxImageSize: 32*1024 // max size in bytes, 32kb limit is strongly recommended due to IE limitations
		}))
		.pipe(minifyCSS({
			keepBreaks: false // New rule will have break if 'true'
		}))
		.pipe(gulp.dest('assets/css'))
		.pipe(size({
			title: 'size of styles'
		}))
		.pipe(browserSync.reload({stream:true}));
});


// gulp.task('styles', function() {
//   gulp.src(dirs.appDst + 'less/**/*.less');                       //TODO: add sass processing, linting, minimizing, uglyfying
// });

// gulp.task('build.js.dev', function() {
//     var tsProject = typescript.createProject('tsconfig.json');
//     var tsResult = tsProject.src()
//         .pipe(typescript(tsProject));
//     return tsResult.js.pipe(gulp.dest(dirs.appDst + 'js/'));
// });


gulp.task('typescript', function() {
  return gulp
    .src([
      "appSrc + 'typescript/**/*.ts'"
    ])
    .pipe(sourcemaps.init())
    .pipe(typescript(tscConfig.compilerOptions))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dirs.assDst + 'js/'));
});

gulp.task('watch', function() {
  gulp.watch(dirs.appSrc + '**/*.html',          ['html.dev']);
  gulp.watch(dirs.appSrc + 'typescript/**/*.ts', ['typescript']);
  gulp.watch(dirs.appSrc + 'less/*.less',        ['styles']);
//  gulp.watch(dirs.appDst + '**/*.html',          ['html']);
});

gulp.task('webserver', function() {
  gulp.src(dirs.appDst)
    .pipe(webserver({
      livereload: true,
      open: true
    }));
});

gulp.task('default', ['libsetup', 'typescript', 'watch', 'webserver']);
