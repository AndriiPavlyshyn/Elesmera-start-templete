let preprocessor = 'sass' // Syntax: sass or scss;
let fileswatch   = 'html,htm,txt,json,md,woff2'
let imageswatch  = 'jpg,jpeg,png,webp,svg'


const { src, dest, parallel, series, watch } = require('gulp');
const sass         = require('gulp-sass');
const browserSync  = require('browser-sync').create();
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify-es').default;
const cleancss     = require('gulp-clean-css');
const rename       = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const notify       = require('gulp-notify');
const newer        = require('gulp-newer');
const imagemin     = require('gulp-imagemin');
const gcmq         = require('gulp-group-css-media-queries');
const rsync        = require('gulp-rsync');
const del          = require('del');

// Local Server

function browsersync() {
	browserSync.init({
		server: { baseDir: 'app' },
		notify: false,
		// online: false, // Work offline without internet connection
	})
}

// Styles

function styles() {
  return src('app/' + preprocessor + '/**/*.' + preprocessor + '')
    .pipe(sass({
      outputStyle: 'expanded'
    }).on("error", notify.onError()))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(gcmq())
    .pipe(dest('app/css'))
    .pipe(cleancss({
      level: {
        1: {
          specialComments: 0
        }
      }
    })) // Opt., comment out when debugging
    .pipe(rename({
      suffix: '.min',
      prefix: ''
    }))
    .pipe(dest('app/css'))
		.pipe(browserSync.reload({
      stream: true
    }))
}

// Images

function img() {
	return src('app/img/src/**/*')
	.pipe(newer('app/img/dest'))
	.pipe(imagemin())
	.pipe(dest('app/img/dest'))
}

function cleanimg() {
	return del('app/images/dest/**/*', { force: true })
}

// Scripts

function scripts() {
  return src([
      'app/libs/jquery/dist/jquery.min.js',
      'app/libs/uikit/uikit.min.js',
      'app/libs/uikit/uikit-icons.min.js',

      // Nice select
      // 'app/libs/niceSelect/jquery.nice-select.min.js',

      // MaskedInput
      // 'app/libs/maskedInput/jquery.maskedinput.min.js',

      // Common file
      'app/js/common.js', // Always at the end
    ])
    .pipe(concat('scripts.js'))
    .pipe(dest('app/js'))
    .pipe(concat('scripts.min.js'))
    .pipe(uglify()) // Mifify js (opt.)
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

// Deploy

function deploy() {
	return src('app/')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Included files
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excluded files
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
}

function code() {
  return src('app/*.html')
    .pipe(browserSync.reload({
      stream: true
    }))
}

// Watching
function startwatch() {
	watch('app/' + preprocessor + '/**/*', parallel('styles'));
	watch(['libs/**/*.js', 'app/js/common.js'], parallel('scripts'));
	watch(['app/**/*.{' + imageswatch + '}'], parallel('img'));
	watch(['app/**/*.{' + fileswatch + '}']).on('change', browserSync.reload);
}

exports.browsersync = browsersync;
exports.assets      = series(cleanimg, styles, scripts, img);
exports.styles      = styles;
exports.scripts     = scripts;
exports.cleanimg    = cleanimg;
exports.img         = img;
exports.deploy      = deploy;
exports.default     = parallel(img, styles, scripts, browsersync, startwatch);
