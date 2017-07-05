var gulp       = require('gulp'),
	sass         = require('gulp-sass'),
	browserSync  = require('browser-sync'),
	concat       = require('gulp-concat'),
	uglify       = require('gulp-uglifyjs'),
	cssnano      = require('gulp-cssnano'),
	rename       = require('gulp-rename'),
	del          = require('del'),
	imagemin     = require('gulp-imagemin'),
	pngquant     = require('imagemin-pngquant'), 
	cache        = require('gulp-cache'), 
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps   = require('gulp-sourcemaps'),
	babel 	 	 = require("gulp-babel"),
	spritesmith  = require('gulp.spritesmith');

gulp.task('sass', function(){
	return gulp.src('app/scss/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compact'})).on('error', sass.logError)
		.pipe(autoprefixer(['last 50 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true})) 
});

gulp.task('browser-sync', function() {
	browserSync({ 
		server: { 
			baseDir: 'app' 
		},
		notify: false 
	});
});

gulp.task('sprites', function() {
    var spriteData = 
        gulp.src('./app/img/icons/*.*')
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: '_sprite.scss',
                cssFormat: 'scss',
                imgPath: "../img/sprite.png",
                algorithm: 'binary-tree',
                cssVarMap: function(sprite) {
                    sprite.name = 's-' + sprite.name
                }
            }));

    spriteData.img.pipe(gulp.dest('./app/img/'));
    spriteData.css.pipe(gulp.dest('./app/scss/'));
});

gulp.task('babel', function () {
  return gulp.src('app/js/es6/*.js')
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest('app/js'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', function() {
	return gulp.src([ 
		'app/libs/*.js'
		])
		.pipe(concat('libs.min.js')) 
		.pipe(uglify()) 
		.pipe(gulp.dest('app/js')); 
});

gulp.task('css-libs', ['sass'], function() {
	return gulp.src('app/css/libs.css') 
		.pipe(cssnano()) 
		.pipe(rename({suffix: '.min'})) 
		.pipe(gulp.dest('app/css')); 
});

gulp.task('watch', ['browser-sync', 'sprites', 'css-libs', 'scripts'], function() {
	gulp.watch('app/scss/**/*.scss', ['sass']); 
	gulp.watch('app/*.html', browserSync.reload); 
	gulp.watch('app/js/**/*.js', ['babel']); 
	gulp.watch('app/img/icons/*.*', ['sprites']);
});

gulp.task('clean', function() {
	return del.sync('dist'); 
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*') 
		.pipe(cache(imagemin({  
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img')); 
});

gulp.task('build', ['clean', 'img', 'sass', 'babel', 'scripts'], function() {

	var buildCss = gulp.src([ 
		'app/css/main.css',
		'app/css/libs.min.css'
		])
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*') 
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src('app/js/**/*') 
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html') 
	.pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('default', ['watch']);
