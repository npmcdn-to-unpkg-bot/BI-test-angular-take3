'use strict';

/*
1) Should execute 'npm run prepare' before the very first run, it will install and symlink all dependencies.
2) Choose between production 'npm start' and development 'npm run start-dev' modes (watcher will run immediately after initial run).
*/

// Dependencies
const env = process.env.NODE_ENV,
  		gulp                = require('gulp'),
  		cache               = require('gulp-cache'),
  		clean               = require('gulp-rimraf'),
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
  		pluginAutoprefix    = require('less-plugin-autoprefix'),
      typescript          = require('gulp-typescript'),
      sourcemaps          = require('gulp-sourcemaps'),
      util                = require('gulp-util'),
      loadPlugins         = require('gulp-load-plugins'),
  		stream              = require('event-stream'),
		  browserSync         = require('browser-sync'),
      pageSpeed           = require('psi'),
      pkg                 = require('./package.json'),
      tsConfig            = require('./tsconfig.json');

// Autoprefixer config
const autoprefix = new pluginAutoprefix({ browsers: [ "Safari >= 8", "iOS >= 7", "Chrome >= 30", "Firefox >= 20", "Explorer >= 9", "last 2 Edge versions" ] });

// Directories
const dir = {
      appDst: 'app/dev/',
      assDst: 'app/dev/assets/',
      appSrc: 'src/'
};

// Prepare banner text
var banner = ['/**',
  ' * <%= pkg.name %> v<%= pkg.version %>',
  ' * <%= pkg.description %>',
  ' * <%= pkg.author.name %> <<%= pkg.author.email %>>',
  ' */',
  ''].join('\n');

// Copy requed libs
gulp.task('js.libs', ['clean', 'clear'], () => {
  return gulp
    .src([
      'node_modules/es6-shim/es6-shim.min.js',
      'node_modules/zone.js/dist/zone.js',
      'node_modules/reflect-metadata/Reflect.js',
      'node_modules/systemjs/dist/system.src.js',
      // TODO > this is too heavy, should find another way
      // 'node_modules/rxjs/',
      // 'node_modules/angular2-in-memory-web-api/',
      // 'node_modules/@angular/'
    ])
    .pipe(gulp.dest(dir.assDst + 'js/lib/ang'))
    .pipe(size({
      title: 'Size of libraries'
    }))
		.pipe(browserSync.reload({stream:true}));
});

// Process TypeScript
gulp.task('js.ts', () => {
  return gulp
    .src([
      dir.appSrc + 'typescript/**/*.ts'
    ])
    .pipe(sourcemaps.init())
    .pipe(typescript(tsConfig.compilerOptions))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dir.assDst + 'js/'))
    .pipe(size({
      title: 'Size of TypeScript js'
    }))
    .pipe(browserSync.reload({stream:true}));
});

// Copy HTML files
gulp.task('html', () => {                    //TODO: add minimizing (in production version)
  return gulp.src(dir.appSrc + 'html/**/*.html')
              .pipe(gulp.dest(dir.appDst))
              .pipe(size({
                title: 'Size of HTML'
              }))
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
			title: 'Size of LESS styles'
		}))
		.pipe(browserSync.reload({stream:true}));
});

//TODO: add sass
gulp.task('styles.scss', () => {
  return gulp.src(dir.appSrc + 'scss/**/*.scss');   //TODO: add sass processing, linting, minimizing, uglyfying
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
  return gulp.src(
    [
      dir.assDst + 'css/*',
      dir.assDst + 'js/*.js*',
      dir.assDst + 'js/lib/*.js',
      dir.assDst + 'js/lib/ang/*.js',
      dir.assDst + 'gfx/*',
      dir.appDst + '*.html'
    ],
    { read: false }
  )
	.pipe(clean());
});

// Clear image cache
gulp.task('clear', () => {
  return cache.clearAll();
});

// Watcher will look for changes and execute tasks
gulp.task('watch', () => {
  gulp.watch(dir.appSrc + '**/*.html',          ['html']);
  gulp.watch(dir.appSrc + 'typescript/**/*.ts', ['js.ts']);
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

// Default task will clean build dirs/build project and clear image cache
gulp.task('default', ['js.libs'], () => {
	gulp.start('styles.less', 'js.ts', 'images', 'html', 'watch', 'webserver');
});
