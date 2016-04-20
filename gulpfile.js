var gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    typescript = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    tscConfig = require('./tsconfig.json');

var appDst = 'app/dev/',
    appSrc = 'src/';

gulp.task('libsetup', function() {
  return gulp
    .src([
      'node_modules/es6-shim/es6-shim.min.js',
      'node_modules/systemjs/dist/system-polyfills.js',
      'node_modules/angular2/bundles/angular2-polyfills.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/rxjs/bundles/Rx.js',
      'node_modules/angular2/bundles/angular2.dev.js'
    ])
    .pipe(gulp.dest(appDst + 'js/lib/ang2'));
});

gulp.task('html', function() {                        //TODO: add minimizing
  gulp.src(appDst + '**/*.html');
});

gulp.task('scss', function() {
  gulp.src(appDst + '**/*.css');                      //TODO: add sass processing, linting, minimizing, uglyfying
});

// gulp.task('build.js.dev', function() {
//     var tsProject = typescript.createProject('tsconfig.json');
//     var tsResult = tsProject.src()
//         .pipe(typescript(tsProject));
//     return tsResult.js.pipe(gulp.dest(appDst + 'js/'));
// });


gulp.task('typescript', function() {
  return gulp
    .src([
      "appSrc + 'typescript/**/*.ts'"
    ])
    .pipe(sourcemaps.init())
    .pipe(typescript(tscConfig.compilerOptions))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(appDst + 'js/'));
});

gulp.task('watch', function() {
  gulp.watch(appSrc + 'typescript/**/*.ts', ['typescript']);
  gulp.watch(appDst + 'css/*.css',          ['scss']);
  gulp.watch(appDst + '**/*.html',          ['html']);
});

gulp.task('webserver', function() {
  gulp.src(appDst)
    .pipe(webserver({
      livereload: true,
      open: true
    }));
});

gulp.task('default', ['libsetup', 'typescript', 'watch', 'webserver']);
