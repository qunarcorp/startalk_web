const gulp = require('gulp')
const babel = require('gulp-babel')
const watch = require('gulp-watch')
const del = require('del')
const dotenv = require('dotenv')
dotenv.config()

const ASSETS = './src/nodeuii/**/*.js'
const DIST_PATH = './dist'

gulp.task('clean', () => {
  return del(DIST_PATH, {
		force: true
	})
})

gulp.task('copyEnv', () => {
  return gulp.src('.env')
    .pipe(gulp.dest('./dist'))
})

gulp.task('copyDotenv', () => {
  return gulp.src('./dotenv.js')
    .pipe(gulp.dest('./dist'))
})

gulp.task('copyEnvs', () => {
  return gulp.src(`./profiles/${process.env.NODE_ENV}/**/*.env`)
    .pipe(gulp.dest(`./dist/profiles/${process.env.NODE_ENV}`))
})

gulp.task('build:dev', () => {
  return watch(ASSETS, { ignoreInitial: false }, () => {
    gulp.src(ASSETS)
    .pipe(babel({
      babelrc: false,
      'plugins': [
        'transform-es2015-modules-commonjs'
      ]
    }))
    .pipe(gulp.dest('./dist'))
  })
})

gulp.task('build:prod', () => {
  return gulp.src(ASSETS)
    .pipe(babel({
      babelrc: false,
      'plugins': [
        'transform-es2015-modules-commonjs'
      ]
    }))
    .pipe(gulp.dest('./dist'))
})

let _task = gulp.series('clean', 'copyEnv', 'copyDotenv', 'copyEnvs', 'build:dev')

if (process.env.NODE_ENV === 'production') {
  _task = gulp.series('clean', 'copyEnv', 'copyDotenv', 'copyEnvs', 'build:prod')
}

gulp.task('default', _task)