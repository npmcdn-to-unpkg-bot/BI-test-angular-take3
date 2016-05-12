(function (global) {
    var map = {
        'app': 'assets/js',
        'rxjs': 'assets/js/lib/ang/rxjs',
        'angular2-in-memory-web-api': 'assets/js/lib/ang/angular2-in-memory-web-api',
        '@angular': 'assets/js/lib/ang/@angular'
    };
    var packages = {
        'app': { main: 'boot', defaultExtension: 'js' },
        'rxjs': { defaultExtension: 'js' },
        'angular2-in-memory-web-api': { defaultExtension: 'js' },
    };
    var packageNames = [
        '@angular/common',
        '@angular/compiler',
        '@angular/core',
        '@angular/http',
        '@angular/platform-browser',
        '@angular/platform-browser-dynamic',
        '@angular/router',
        '@angular/router-deprecated',
        '@angular/testing',
        '@angular/upgrade',
    ];
    packageNames.forEach(function (pkgName) {
        packages[pkgName] = { main: 'index.js', defaultExtension: 'js' };
    });
    var config = {
        map: map,
        packages: packages
    };
    if (global.filterSystemConfig) {
        global.filterSystemConfig(config);
    }
    System.config(config);
})(this);
//# sourceMappingURL=systemjs.config.js.map