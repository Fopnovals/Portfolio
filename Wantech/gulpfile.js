"use strict";

const
    gulp = require('gulp'),
    scss = require('gulp-sass'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    imagemin = require('gulp-imagemin'),
    spritesmith = require('gulp.spritesmith'),
    autoprefixer = require('gulp-autoprefixer'),
    handlebars = require('gulp-compile-handlebars'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

gulp
    .task('browsersync', () => {
        browserSync.init({
            server: {
                baseDir: ""
            }
        });
    })
    .task('images', () => {
        gulp.src('src/img/**/*')
            .pipe(imagemin())
            .pipe(gulp.dest('img'))
    })
    .task('sprite', () => {
        let spriteData =
            gulp
                .src('src/sprite/*.png')
                .pipe(spritesmith({
                    imgName: 'icons.png',
                    cssName: 'icons.css'
                }));
        return spriteData.pipe(gulp.dest('src/img'));
    })
    .task('vendor', () => {
        gulp.src([
            'src/js/vendor/jquery.min.js',
            'src/js/vendor/plugins/**/*.js'
        ])
            .pipe(concat('vendor.js'))
            .pipe(uglify())
            .pipe(gulp.dest('js'))
            .pipe(reload({stream: true}));
    })
    .task('js', () => {
        gulp.src('src/js/app/**/*.js')
            .pipe(plumber())
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(concat('main.js'))
            .pipe(gulp.dest('js'))
            .pipe(reload({stream: true}));
    })
    .task('scss', () => {
        gulp.src('src/scss/**/*.scss')
            .pipe(plumber())
            .pipe(scss({
                outputStyle: 'expanded'
            }))
            .pipe(autoprefixer({
                browsers: ['last 50 versions', '> 1%', 'ie 8', 'ie 7'],
                cascade: true
            }))
            .pipe(gulp.dest('css'))
            .pipe(reload({stream: true}));
    })
    .task('hbs', () => {
        return gulp.src('src/html/*.html')
            .pipe(handlebars({}, {
                batch: ['src/partials']
            }))
            .pipe(gulp.dest(''));
    })
    .task('default', ['browsersync', 'vendor', 'js', 'scss', 'hbs'], () => {
        gulp.watch("src/html/*.html", ['hbs']);
        gulp.watch("src/partials/*.hbs", ['hbs']);
        gulp.watch('src/scss/**/*.scss', ['scss']);
        gulp.watch('src/js/vendor/**/*.js', ['vendor']);
        gulp.watch('src/js/app/**/*.js', ['js']);
        gulp.watch(["**/*.html"]).on('change', browserSync.reload);
        gulp.watch(["**/*.hbs"]).on('change', browserSync.reload);
    });
