'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

function buildStyles() {
    return gulp.src('./styles/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./styles'));
}

exports.buildStyles = buildStyles;
exports.watch = function() {
    gulp.watch('./styles/scss/*.scss', buildStyles);
}