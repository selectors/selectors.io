module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    less: {
      production: {
        options: {
          paths: ["less"]
        },
        files: {
          "src/css/core.css": "less/core.less"
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', ['less']);
};