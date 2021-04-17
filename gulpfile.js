let gulp = require('gulp')

let sass = require('gulp-sass')

gulp.task('sass', function () {
	return gulp.src('app/scss/styles.scss')
	.pipe(sass() )
	.pipe(gulp.dest('app/css') )
} )


gulp.task('watch', function(){
  gulp.watch('app/scss/**/*.scss', ['sass'])
})