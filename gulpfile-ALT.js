var gulp = require('gulp'),
    webserver   = require('gulp-webserver'),
    typescript  = require('gulp-typescript'),
    sourcemaps  = require('gulp-sourcemaps'),
    tscConfig   = require('./tsconfig.json');

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

gulp.task('assets', function() {
  gulp.src(['./src/**/*.json',
            './src/**/*.html',
            './src/**/*.css'])
    .pipe(gulp.dest(appDst));
});

gulp.task('watch',
          ['watch.assets',
           'watch.ts',
           'watch.app']);

gulp.task('watch.assets', ['assets'], function() {
  return gulp.watch(['./src/**/*.json',
                     './src/**/*.html',
                     './src/**/*.css'],
                    ['assets']);
});

function notifyLiveReload() { }

gulp.task('watch.app', function() {
  gulp.watch('app/**', notifyLiveReload);
});

gulp.task('watch.ts', ['ts'], function() {
  return gulp.watch('src/**/*.ts', ['ts']);
});

gulp.task('ts', function() {
  console.log('Typescript compilation here.');
});

gulp.task('typescript', function(done) {
  var tsResult = gulp.src([
      "node_modules/angular2/bundles/typings/angular2/angular2.d.ts",
      "node_modules/angular2/bundles/typings/angular2/http.d.ts",
      "node_modules/angular2/bundles/typings/angular2/router.d.ts",
      "node_modules/@reactivex/rxjs/dist/es6/Rx.d.ts",
      appSrc + 'typescript/'
    ])
    .pipe(ts(tsProject), undefined, ts.reporter.fullReporter());
  return tsResult.js.pipe(gulp.dest(appDst + 'js/'));
});

// http://chariotsolutions.com/blog/post/typescript-angular2-starter-project-walkthrough-putting-together-express-livereload/

function notifyLiveReload(event) {
  var fileName = require('path')
                  .relative(__dirname + appDst,
                            event.path);
  tinylr.changed({
    body: {
      files: [fileName]
    }
  });
}


gulp.task('express', function() {
  var express = require('express');
  var app = express();
  app.use(require('connect-livereload')({
    port: 35729
  }));
  app.use(express.static(__dirname + appDst));
  app.listen(4000, '0.0.0.0');
});

gulp.task('livereload', function() {
  tinylr = require('tiny-lr')();
  tinylr.listen(35729);
});



gulp.task('default', ['libsetup', 'typescript', 'watch', 'webserver']);
