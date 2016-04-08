module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      production: {
        options: {
          paths: ["src/less"]
        },
        files: {
          "dist/css/core.css": "src/less/core.less"
        }
      }
    },
    concat: {
      babel: {
        options: {
          separator: ';\n',
          banner: '/*!\n'
                + ' * Selectors.io - https://github.com/selectors/selectors.io\n\n'
                + ' * Last built: <%= grunt.template.today("dddd, dS mmmm yyyy; h:MM:ss TT") %>\n'
                + ' */\n\n',
        },
        src: [
          'src/babel/SelectorInput.js',
          'src/babel/SelectorSequences.js',
          'src/babel/FormattedSelectorValidation.js',
          'src/babel/FormattedElement.js',
          'src/babel/FormattedSelectorSequence.js',
          'src/babel/SelectorSequenceSummary.js',
          'src/babel/SelectorsIOMain.js',
          'src/babel/init.js'
        ],
        dest: 'dist/scripts/ui.js'
      },
    },
    uglify: {
      options: {
        banner: '/*!\n'
              + ' * Selectors.io - https://github.com/selectors/selectors.io\n\n'
              + ' * Last built: <%= grunt.template.today("dddd, dS mmmm yyyy; h:MM:ss TT") %>\n'
              + ' */\n\n',
      },
      js: {
        files: {
          'dist/scripts/core.min.js': ['src/js/core.js']
        }
      }
    },
  });
  
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['less', 'concat', 'uglify']);
};