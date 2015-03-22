/** 
 * suhaotian's gulpfile.js 
 */
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var scss = require('gulp-ruby-sass');
var spriteSmith = require('gulp.spritesmith');

var minifyCss=require('gulp-minify-css');
var minifyHtml=require('gulp-minify-html');

var browserify = require('gulp-browserify');
var reactify   = require('reactify');
// var source = require('vinyl-source-stream');
// var buffer = require('vinyl-buffer');
// var watchify = require('watchify');
var uglify = require('gulp-uglify');

var imageMin = require('gulp-imagemin');

var browserSync = require('browser-sync');
var compress = require('compression');

var jsLint = require('gulp-jshint');
var htmlLint = require('gulp-htmlhint');
var lessLint = require('gulp-recess');

var rename = require('gulp-rename');
var reload = browserSync.reload;

/**   
 * Task Name List
 *  
 *  http-serve       // No gzip support 
 *  gzip-http-serve  // Gzip support
 *  compile-scss     // Compile scss file
 *  build-css        // Concat and Minify CSS
 *  build-js         // Build js
 *  build-jsx        // Build JSX
 *  build-html       // Build HTML
 *  sprite-imgs      // Sprite images
 *  lint-all         // html/css/js lint
 *  lint-less        // lint less file
 *  lint-css         // lint css files
 *  lint-html        // lint html file
 *  lint-js          // lint js file
 *  minify-imgs      // minify images
 *  minify-html      // minify html file
 *  minify-js        // minify js file
 *  watch            // watch files change to do something
 *  build-all        // build css/js/html/images
*/



//js config
var jsPath = "./dev/js/";
var jsName = jsPath + "main.js";
var buildJsPath = './build/js/';
var buildJsName = 'build.js';
var jsFiles = [
    jsName
];

//browserify config
var isDebug = true;
var browserifyConfig={
    insertGlobals: false,
    debug: isDebug,
    transform: [reactify]
}


//html config
var htmlName = "./dev/index.html";
var htmlFiles = [
    htmlName  
];
var buildHtmlPath = './build/'
//less compile config
var lessName = './dev/scss/*.scss';
var lessPath = [
    lessName
];

//css config
var buildCssName = 'build.css';
var buildCssPath = './build/css/';
var cssFiles = [
    './dev/css/*.css'
];
//autoprefixer config
var prefixer = {
	browsers: ['last 2 version', 'ie 8', 'ie 9', 'ios 6', 'android 4'],
	cascade: false
}

//*browserSync config 
var isGzip = true;
var baseDir = './build';
var port = 3000;
var gzipPort = port + 1;

//sprite images config
var spriteImgName = 'icons.png';
var spriteCssName = 'icons.css';

var imgPath = './build/images/'
var cssPath = './dev/css/';
var imgPathName = '../images/' + spriteImgName;
var spriteImgs = [
    './dev/images/sprite/*.png'
];

//imagemin config
var imgFiles=[
    './dev/images/*'
];
var buildImgPath = './build/images/';

gulp.task('reload',function(){
    browserSync.reload();
});
//watch task config

gulp.task('watch',['http-serve'],function(){
    gulp.watch(htmlName,['build-html']);
    gulp.watch(lessName,['build-css']);
    gulp.watch(jsName,['build-js']);
});

//build all
gulp.task('build-all',['compile-scss','build-css','build-js','build-html'],function(){
    console.log('\n********* Done ************');
});

gulp.task('image-min',function(){
    gulp.src(imgFiles)
        .pipe(imageMin())
        .pipe(gulp.dest(buildImgPath))
});


//sprite images
gulp.task('sprite-imgs',function(){
    var data = gulp.src(spriteImgs)
    .pipe(spriteSmith({
        imgName: spriteImgName,
        cssName: spriteCssName,
        imgPath: imgPathName
    }));
    data.img.pipe(gulp.dest(imgPath));
    data.css.pipe(gulp.dest(cssPath));
});



//lint html/css/js files
gulp.task('lint-all',['lint-less','lint-html','lint-js']);


// gulp.task('lint-css',function(){
//     gulp.src(cssFiles)
//         .pipe(lessLint())
//         .pipe(lessLint.reporter())
// });

// gulp.task('lint-less', function(){
//     gulp.src(lessPath)
//         // .pipe(lessLint())
//         // .pipe(lessLint.reporter())
// });

gulp.task('lint-js', function(){
    gulp.src(jsFiles)
    .pipe(jsLint())
    .pipe(jsLint.reporter('default', { verbose: true }))
});

gulp.task('lint-html', function(){
    gulp.src(htmlFiles)
        .pipe(htmlLint())
        .pipe(htmlLint.reporter())
});

//compile less file

gulp.task('compile-scss', function(){
    gulp.src(lessPath)
        .pipe(scss({
            style: 'expanded',
            compass: true,
            "sourcemap=none": true
        }))
        .pipe(autoprefixer(prefixer))
        .pipe(gulp.dest(cssPath))
        .pipe(reload({stream:true}));
});

gulp.task('build-css',['compile-scss'],function(){
    return gulp.src(cssFiles)
        .pipe(concat(buildCssName))
        .pipe(minifyCss({keepSpecialComments:0}))
        .pipe(gulp.dest(buildCssPath))
        .pipe(reload({stream:true}));
});

gulp.task('build-js',['lint-js'],function(){
    gulp.src(jsFiles)
        .pipe(browserify())
        .pipe(rename(buildJsName))
        .pipe(uglify())
        .pipe(gulp.dest(buildJsPath))
        .pipe(reload({stream:true}))
});

gulp.task('build-jsx',[],function(){
    gulp.src(jsFiles)
        .pipe(browserify(browserifyConfig))
        .pipe(rename(buildJsName))
        .pipe(uglify())
        .pipe(gulp.dest(buildJsPath))
        .pipe(reload({stream:true}))
});

gulp.task('build-html',['lint-html'],function(){
    gulp.src(htmlFiles)
        .pipe(minifyHtml({conditionals: true}))
        .pipe(gulp.dest(buildHtmlPath))
        .pipe(reload({stream:true}))
});

//gzip http serve
gulp.task('gzip-http-serve',function(){
    browserSync({
        server: {
            baseDir: baseDir,
            middleware: function(req,res,next){
                if(isGzip) {
                    var gzip = compress();
                    gzip(req,res,next);
                }else{
                    next();
                }
            }
        },
        port: gzipPort 
    });
});

//http serve
gulp.task('http-serve',function () {
    browserSync({
        server:{
            baseDir: baseDir
        },
        port: port
    });
});




