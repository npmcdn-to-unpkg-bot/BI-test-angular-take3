// 'use strict'

/*
1) Should execute 'npm run prepare' before the very first run, it will install and symlink all dependencies.
2) Choose between production 'npm start' and development 'npm run start-dev' modes (watcher will run immediately after initial run).
*/

// Dependencies
const env = process.env.NODE_ENV,
  		gulp                = require('gulp'),
  		cache               = require('gulp-cache'),
  		clean               = require('gulp-rimraf'),
  		stream              = require('event-stream'),
		  browserSync         = require('browser-sync').create(),
  		uglify              = require('gulp-uglify'),
  		size                = require('gulp-size'),
  		concat              = require('gulp-concat'),
  		header              = require('gulp-header'),
  		minifyCSS           = require('gulp-minify-css'),
  		base64              = require('gulp-base64'),
  		imagemin            = require('gulp-imagemin'),
  		less                = require('gulp-less'),
  		rename              = require('gulp-rename'),
  		notify              = require("gulp-notify"),
  		pluginAutoprefix    = require('less-plugin-autoprefix');
      typescript          = require('gulp-typescript'),
      sourcemaps          = require('gulp-sourcemaps'),
      pkg                 = require('./package.json'),
      tsConfig            = require('./tsconfig.json');

// Autoprefixer config
const autoprefix = new pluginAutoprefix({ browsers: ["Safari >= 8", "iOS >= 7", "Chrome >= 30", "Explorer >= 9", "last 2 Edge versions", "Firefox >= 20"] });

// Directories
const dir = {
      appDst: 'app/dev/',
      assDst: 'app/dev/assets/',
      appSrc: 'src/'
};

gulp.task('js.libsetup', () => {
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
    .pipe(gulp.dest(dir.assDst + 'js/lib/ang2'))
    .pipe(size({
      title: 'size of libraries'
    }));

});

// Prepare banner text
var banner = ['/**',
  ' * <%= pkg.name %> v<%= pkg.version %>',
  ' * <%= pkg.description %>',
  ' * <%= pkg.author.name %> <<%= pkg.author.email %>>',
  ' */',
  ''].join('\n');

// Lint scripts
/*
gulp.task('lint', () => {
	return gulp.src('js/custom.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});
*/

// Build views with Jade
/*
gulp.task('html', () => {
	var localsObject = {};

	gulp.src('views/*.jade')
	.pipe(jade({
	  locals: localsObject
	}))
	.pipe(gulp.dest('assets'))
	.pipe(browserSync.reload({stream:true}));
});
*/

// Copy HTML files
gulp.task('html', () => {                    //TODO: add minimizing
  gulp.src(dir.appSrc + 'html/**/*.html')
      .pipe(gulp.dest(dir.appDst))
      .pipe(browserSync.reload({stream:true}));
});

// Concat and minify styles. Compile *.less-files to css. Convert small images to base64, minify css
gulp.task('styles.less', () => {
	return gulp.src(dir.appSrc + 'less/style.less')
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
    .pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest(dir.assDst + 'css'))
		.pipe(size({
			title: 'size of LESS styles'
		}))
		.pipe(browserSync.reload({stream:true}));
});

//TODO: add sass
gulp.task('styles.scss', () => {
  gulp.src(dir.appSrc + 'scss/**/*.scss');   //TODO: add sass processing, linting, minimizing, uglyfying
});

gulp.task('js.typescript', () => {
  return gulp
    .src([
      dir.appSrc + 'typescript/**/*.ts'
    ])
    .pipe(sourcemaps.init())
    .pipe(typescript(tsConfig.compilerOptions))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dir.assDst + 'js/'))
    .pipe(size({
      title: 'size of TypeScript js'
    }))
    .pipe(browserSync.reload({stream:true}));
});

// Compress images — Will cache to process only changed images, but not all in image folder [ optimizationLevel - range from 0 to 7 (compression will work from 1) which means number of attempts ]
gulp.task('images', () => {
	return gulp
    .src([
      dir.appSrc + 'gfx/*',
      !dir.appSrc + 'gfx/*.db'
    ])
		.pipe(cache(imagemin({
			optimizationLevel: 5,
			progressive: true,
			interlaced: true
		})))
		.on("error", notify.onError({
			message: 'Images processing error: <%= error.message %>'
		}))
		.pipe(gulp.dest(dir.assDst + 'gfx'))
		.pipe(size({
			title: 'Size of images'
		}));
});

// Clean destination dir and rebuild project
gulp.task('clean', () => {
  return gulp
  .src(
    [
      dir.assDst + 'css/*',
      dir.assDst + 'js/*',
      dir.assDst + 'gfx/*',
      dir.appDst + '*.html'
    ],
    {
      read: false
    }
  )
	.pipe(clean());
});

// Clear image cache
gulp.task('clear', (done) => {
  return cache.clearAll(done);
});

// Watcher will look for changes and execute tasks
gulp.task('watch', () => {
  gulp.watch(dir.appSrc + '**/*.html',          ['html']);
  gulp.watch(dir.appSrc + 'typescript/**/*.ts', ['js.typescript']);
  gulp.watch(dir.appSrc + 'less/*.less',        ['styles.less']);
  gulp.watch(dir.appSrc + 'gfx/*',              ['images']);
//  gulp.watch(dir.appSrc + 'scss/*.scss',        ['styles.scss']);
});

// Livereload will up local server and inject all changes made
gulp.task('webserver', () => {
	browserSync({
		server: {
			baseDir: dir.appDst
		}
	});
});

// gulp.task('default', ['js.libsetup', 'js.typescript', 'watch', 'webserver']);

// Default task will clean build dirs/build project and clear image cache
gulp.task('default', ['clean', 'clear', 'js.libsetup'], () => {
	gulp.start('styles', 'scripts', 'images', 'html');
});
