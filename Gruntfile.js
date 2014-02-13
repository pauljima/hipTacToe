module.exports = function(grunt) {
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),

    less : {
      options: {
        paths: [ __dirname + '/less' ],
        strictImports : true
      },
      build : {
        files: {
          'css/main.css' : [ __dirname + '/less/main.less' ]
        }        
      }
    },

    watch: {
      less: {
        files: [ __dirname + '/less/**/*.less' ],
        tasks: ['less'],
        options: {
          spawn: false,
        },
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [ 'less' ]);
};