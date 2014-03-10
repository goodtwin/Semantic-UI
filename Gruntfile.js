module.exports = function(grunt) {

  var

    defaultTasks = [
      // run grunt watch
      'watch'
    ],

    watchTasks = [
      // compiles scss to docs
      'scss:buildDocsCSS',

      // auto prefix doc files
      'autoprefixer:prefixFile',

      // copies assets and js over to docs
      'copy:srcToDocs',

      // copies examples over to docs
      'copy:examplesToDocs',

      // create concatenated css release
      'concat:createDocsCSSPackage',

      // create concatenated js release
      'concat:createDocsJSPackage'
    ],

    testWatchTasks = [
      'clear',
      'karma:watch:run'
    ],

    testTasks = [
      // compiles scss to docs so phantomjs can read
      'scss:buildTestCSS',

      // test components
      'karma:travis'
    ],

    resetTasks = [
      // clean build directory
      'clean:build',

      // cleans previous generated release
      'clean:release'
    ],

    releaseTasks = [
      // clean build directory
      'clean:build',

      // copies assets and js over to build dir
      'copy:srcToBuild',

      // compiles scss
      'sass:buildCSS',

      // auto prefix docs files
      'autoprefixer:prefixDocs',

      // auto prefix build files
      'autoprefixer:prefixBuild',

      // creates minified js of each file
      'uglify:minifyJS',

      // creates minified css of each file
      'cssmin:minifyCSS',

      // create concatenated css release
      'concat:createCSSPackage',

      // create concatenated js release
      'concat:createJSPackage',

      // creates release js of all together
      'uglify:createMinJSPackage',

      // creates custom license in header
      'cssmin:createMinCSSPackage',

      // cleans previous generated release
      'clean:release'

    ],

    rtlTasks = [
      // copies assets to rtl
      'copy:buildToRTL',

      // create rtl release
      'cssjanus:rtl'
    ],

    docTasks = [

      // copies examples over to docs
      'copy:examplesToDocs',

      // creates release zip
      'compress:everything',

      // copies files over to docs
      'copy:buildToDocs',

      // generate code docs
      'docco:generate',

      // copies spec files over to docs
      'copy:specToDocs'
    ],

    buildTasks = releaseTasks.concat(rtlTasks).concat(docTasks),

    setWatchTests = function(action, filePath) {
      var
        karmaFiles   = grunt.config('karma.watch.files'),
        isJavascript = (filePath.search('.js') !== -1),
        isModule     = (filePath.search('modules/') !== -1),
        isSpec       = (filePath.search('.spec') !== -1),
        specFile     = (isSpec)
          ? filePath
          : filePath
              .replace('src/', 'test/')
              .replace('.js', '.spec.js')
      ;
      if(isJavascript && (isSpec || isModule) ) {
        karmaFiles.pop();
        karmaFiles.push(specFile);
      }
    },

    setWatchFiles = function(action, filePath) {
      var
        buildPath = filePath.replace('src/', 'docs/build/uncompressed/').replace('scss', 'css')
      ;
      if(filePath.search('.scss') !== -1) {
        grunt.config('scss.buildDocsCSS.src', filePath);
        grunt.config('scss.buildDocsCSS.dest', buildPath);
        grunt.config('autoprefixer.prefixFile.src', buildPath);
      }
      else {
        grunt.config('scss.buildDocsCSS.src', 'non/existant/path');
        grunt.config('scss.buildDocsCSS.dest', 'non/existant/path');
        grunt.config('autoprefixer.prefixFile.src', 'non/existant/path');
      }
    },

    // this allows filenames with multiple extensions to be preserved
    preserveFileExtensions = function(folder, filename) {
      return folder + filename.substring(0, filename.lastIndexOf('.') ) + '.css';
    },
    preserveMinFileExtensions = function(folder, filename) {
      return folder + filename.substring(0, filename.lastIndexOf('.') ) + '.min.css';
    },

    config
  ;

  config = {

    package : grunt.file.readJSON('package.json'),

    /*******************************
                 Watch
    *******************************/

    // watches for changes in a source folder
    watch: {
      options: {
        spawn: false
      },
      scripts: {
        files: [
          'test/**/*.js',
          'src/**/*.js'
        ],
        tasks : testWatchTasks
      },
      src: {
        files: [
          'build/examples/**/*',
          'src/**/*.scss',
          'src/**/*.js'
        ],
        tasks : watchTasks
      }
    },

    /*******************************
                  Test
    *******************************/

    clear: {
      terminal: {

      }
    },

    karma: {
      watch: {
        configFile : 'karma.conf.js',
        background : true
      },
      travis: {
        configFile : 'karma.conf.js',
        singleRun  : true
      }
    },

    /*******************************
                Build
    *******************************/
    autoprefixer: {
      options: {
        browsers: [
          'last 2 version',
          '> 1%',
          'opera 12.1',
          'safari 6',
          'ie 9',
          'bb 10',
          'android 4'
        ]
      },
      prefixBuild: {
        expand : true,
        cwd    : 'build/',
        dest   : 'build/',
        src    : [
          '**/*.css'
        ]
      },
      prefixDocs: {
        expand : true,
        cwd    : 'docs/build/',
        dest   : 'docs/build/',
        src    : [
          '**/*.css'
        ]
      },
      prefixFile: {
        src : 'docs/build/**/*.css'
      }
    },

    clean: {
      options: {
        force: true
      },
      build : [
        'build/scss',
        'build/minified',
        'build/packaged',
        'build/uncompressed'
      ],
      release : [
        'docs/build',
        'rtl'
      ]
    },

    docco: {
      generate: {
        options: {
          css    : 'spec/assets/docco.css',
          output : 'spec/docs/'
        },
        files: [
          {
            expand : true,
            cwd    : 'spec/',
            src    : [
              '**.commented.js'
            ]
          }
        ]
      }
    },

    cssjanus: {
      rtl: {
        expand : true,
        cwd    : 'build/',
        src    : [
          '**/*.scss',
          '**/*.css',
        ],
        dest   : 'rtl'
      },
    },

    sass: {

      // optimized for watch, src is built on watch task using callbacks
      buildDocsCSS: {
				src: 'src/testapp.scss',
				dest: 'docs/build/uncompressed/',
				expand: true,
				ext: '.css',
        rename : preserveFileExtensions
      },
      buildTestCSS: {
        src: 'src/**/*.scss',
        dest: 'docs/build/uncompressed/',
        expand: true,
        ext: '.css',
        rename : preserveFileExtensions
      },
      buildCSS: {
        src: 'src/testapp.scss',
        dest: 'build/uncompressed/',
        expand: true,
        ext: '.css',
        rename : preserveFileExtensions
      }
    },

    copy: {

      srcToDocs: {

        files: [
          // exact copy for scss
          {
            expand : true,
            cwd    : 'src/**/*.scss',
            src    : [
              '**/*'
            ],
            dest : 'docs/build/scss'
          },
          // copy everything but scss files for uncompressed release
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              '**/*.js',
              'assets/images/*',
              'assets/fonts/*'
            ],
            dest : 'docs/build/uncompressed'
          },
          // copy assets only for minified version
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              'assets/images/*',
              'assets/fonts/*'
            ],
            dest : 'docs/build/minified'
          },

          // copy assets only for packaged version
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              'assets/images/*',
              'assets/fonts/*'
            ],
            dest : 'docs/build/packaged'
          }
        ]
      },

      srcToBuild: {

        files: [
          // exact copy for scss
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              '**/*'
            ],
            dest : 'build/scss'
          },
          // copy everything but scss files for uncompressed release
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              '**/*.js',
              'assets/images/*',
              'assets/fonts/*'
            ],
            dest : 'build/uncompressed'
          },
          // copy assets only for minified version
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              'assets/images/*',
              'assets/fonts/*'
            ],
            dest : 'build/minified'
          },

          // copy assets only for packaged version
          {
            expand : true,
            cwd    : 'src/',
            src    : [
              'assets/images/*',
              'assets/fonts/*'
            ],
            dest : 'build/packaged'
          }
        ]
      },

      // create new rtl assets
      buildToRTL: {
        files: [
          {
            expand : true,
            cwd    : 'build/',
            src    : [
              '**'
            ],
            dest   : 'rtl'
          }
        ]
      },

      // make library available in docs
      buildToDocs: {
        files: [
          {
            expand : true,
            cwd    : 'build/',
            src    : [
              '**'
            ],
            dest   : 'docs/build/'
          }
        ]
      },

      // copy spec files to docs
      specToDocs: {
        files: [
          {
            expand : true,
            cwd    : 'spec',
            src    : [
              '**'
            ],
            dest   : 'docs/spec/'
          }
        ]
      },

      // copy spec files to docs
      examplesToDocs: {
        files: [
          {
            expand : true,
            cwd    : 'build/examples',
            src    : [
              '**'
            ],
            dest   : 'docs/build/examples/'
          }
        ]
      }

    },


    compress: {
      options: {
        archive: 'docs/build/semantic.zip'
      },
      everything: {
        files: [
          {
            expand : true,
            cwd    : 'build/',
            src    : [
              '**'
            ]
          }
        ]
      }
    },

    concat: {
      options: {
      },
      createCSSPackage: {
        src: ['build/uncompressed/**/*.css'],
        dest: 'build/packaged/css/semantic.css'
      },
      createJSPackage: {
        src: ['build/uncompressed/**/*.js'],
        dest: 'build/packaged/javascript/semantic.js'
      },
      createDocsCSSPackage: {
        src: ['docs/build/uncompressed/**/*.css'],
        dest: 'docs/build/packaged/css/semantic.css'
      },
      createDocsJSPackage: {
        src: ['docs/build/uncompressed/**/*.js'],
        dest: 'docs/build/packaged/javascript/semantic.js'
      },
    },

    cssmin: {
      options : {
        keepSpecialComments: 0,
        report: 'min',
        banner : '' +
          '/*\n' +
          '* # <%= package.title %>\n' +
          '* Version: <%= package.version %>\n' +
          '* http://github.com/jlukic/semantic-ui\n' +
          '*\n' +
          '*\n' +
          '* Copyright <%= grunt.template.today("yyyy") %> Contributors\n' +
          '* Released under the MIT license\n' +
          '* http://opensource.org/licenses/MIT\n' +
          '*\n' +
          '* Released: <%= grunt.template.today("mm/dd/yyyy") %>\n' +
          '*/\n'
      },

      // copy minified css to minified release
      minifyCSS: {
        expand : true,
        cwd    : 'build/uncompressed',
        src    : [
          '**/*.css'
        ],
        dest : 'build/minified/',
        rename: preserveMinFileExtensions
      },

      // add comment banner to css release
      createMinCSSPackage: {
        files: {
          'build/packaged/css/semantic.min.css': [
            'build/uncompressed/**/*.css'
          ]
        }
      }
    },

    uglify: {

      minifyJS: {
        expand : true,
        cwd    : 'build/uncompressed',
        src    : [
          '**/*.js'
        ],
        dest : 'build/minified',
        ext  : '.min.js',
        banner   : '' +
          '/*' +
          '* # <%= package.title %>\n' +
          '* Version: <%= package.version %>\n' +
          '* http://github.com/jlukic/semantic-ui\n' +
          '*\n' +
          '*\n' +
          '* Copyright <%= grunt.template.today("yyyy") %> Contributors\n' +
          '* Released under the MIT license\n' +
          '* http://opensource.org/licenses/MIT\n' +
          '*\n' +
          '* Release Date: <%= grunt.template.today("mm/dd/yyyy") %>\n' +
          '*/\n'
      },

      createMinJSPackage: {
        options: {
          mangle   : true,
          compress : true,
          banner   : '' +
            '/*' +
            '* # <%= package.title %>\n' +
            '* Version: <%= package.version %>\n' +
            '* http://github.com/jlukic/semantic-ui\n' +
            '*\n' +
            '*\n' +
            '* Copyright <%= grunt.template.today("yyyy") %> Contributors\n' +
            '* Released under the MIT license\n' +
            '* http://opensource.org/licenses/MIT\n' +
            '*\n' +
            '* Release Date: <%= grunt.template.today("mm/dd/yyyy") %>\n' +
            '*/\n'
        },
        files: {
          'build/packaged/javascript/semantic.min.js': [
            'build/uncompressed/**/*.js'
          ]
        }
      }
    },

    coveralls: {
        options: {
            coverage_dir: 'coverage'
        }
    }

  };


  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-docco-multi');
  grunt.loadNpmTasks('grunt-cssjanus');
  grunt.loadNpmTasks('grunt-clear');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-karma-coveralls');

  grunt.initConfig(config);

  grunt.registerTask('default', defaultTasks);
  grunt.registerTask('test', testTasks);

  grunt.registerTask('release', releaseTasks);
  grunt.registerTask('rtl', rtlTasks);
  grunt.registerTask('docs', docTasks);
  grunt.registerTask('build', buildTasks);
  grunt.registerTask('reset', resetTasks);

  // compiles only changed scss files <https://npmjs.org/package/grunt-contrib-watch>
  grunt.event.on('watch', setWatchFiles);

};
