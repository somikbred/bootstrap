'use strict';

var gulp       	 = require('gulp');
var browserSync	 = require('browser-sync').create();
var sass       	 = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var rigger       = require('gulp-rigger');
var cleanCSS     = require('gulp-clean-css');
var rename       = require('gulp-rename');
var imagemin     = require('gulp-imagemin');
var imgCompress  = require('imagemin-jpeg-recompress');
var clean        = require('gulp-clean');

// Compile sass into CSS & auto-inject into browsers
gulp.task('clean-sass', function() {
    return gulp.src('dist/css', {allowEmpty: true})
        .pipe(clean());
});


gulp.task('sass', gulp.series('clean-sass', function() {
        return gulp.src("src/scss/*.scss")
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest("dist/css"))
        .pipe(cleanCSS({debug: true}, (details) => {
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
        }))
        .pipe(rename({
            suffix : '.min'
        }))
        .pipe(gulp.dest("dist/css"))
        .pipe(browserSync.stream());
}));

gulp.task('clean-html', function() {
    return gulp.src('dist/.html', {allowEmpty: true})
        .pipe(clean());
});

gulp.task('html', gulp.series('clean-html', function() {
        return gulp.src([
        'src/**/*.html',
        '!src/partials/_*.html'])
        .pipe(rigger())
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
}));

gulp.task('clean-img', function() {
    return gulp.src('dist/img', {allowEmpty: true})
    .pipe(clean()) 
});


gulp.task('img',gulp.series('clean-img', function() {
       return gulp.src('src/favicon.ico')
            .pipe(gulp.dest('dist')) &&
        gulp.src('src/img/**/*.*')
        .pipe(imagemin([
            imgCompress({
                loops: 4,
                min: 70,
                max: 80,
                quality: 'high'
            }),
            imagemin.gifsicle(),
            imagemin.optipng(),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
}));

gulp.task('clean-fonts', function() {
    return gulp.src('dist/fonts/**/*.*', {allowEmpty: true})
        .pipe(clean());
});


gulp.task('fonts', gulp.series('clean-fonts', function() {
    return gulp.src('src/fonts/**/*.*')
        .pipe(gulp.dest('dist/fonts'))
        .pipe(browserSync.stream())
}));

gulp.task('clean', function() {
    return gulp.src('dist', {allowEmpty: true})
            .pipe(clean());
});

// Static Server + watching scss/html files
gulp.task('serve', gulp.series('clean', 'html', 'sass', 'img', 'fonts', function() {

    browserSync.init({
        server: "./dist"
    });

    gulp.watch("src/scss/*.scss", gulp.parallel('sass'));
    gulp.watch("src/**/*.html", gulp.parallel('html'));
    gulp.watch("src/img/**/*.*", gulp.parallel('img'));
    gulp.watch("src/fonts/**/*.*", gulp.parallel('fonts'));
    gulp.watch("src/js/*.js").on('change', browserSync.reload);
}));


gulp.task('default', gulp.series('serve'));