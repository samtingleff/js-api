module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg : grunt.file.readJSON("package.json"),
		clean : [ "www/prod/v1/*", "src/*.min.*", "src/crypto-js/crypto.js" ],
		jshint : {
			all : [ "Gruntfile.js", "src/<%= pkg.name %>.js",
					"src/<%= pkg.name %>.html.js" ]
		},
		concat : {
			ctjs : {
				files : {
					"src/crypto-js/crypto.js" : [
							"src/crypto-js/v3.1.2/core.js",
							"src/crypto-js/v3.1.2/enc-base64.js" ,
							"src/crypto-js/v3.1.2/sha256.js" ],
					"www/prod/v1/<%= pkg.name %>.js" : [
							"src/crypto-js/crypto.js",
							"src/<%= pkg.name %>.commons.js",
							"src/<%= pkg.name %>.js" ],
					"www/prod/v1/<%= pkg.name %>.html" : [
							"src/<%= pkg.name %>HtmlTop",
							"src/crypto-js/crypto.js",
							"src/mersenne-twister.js",
							"src/<%= pkg.name %>.commons.js",
							"src/<%= pkg.name %>.html.js",
							"src/<%= pkg.name %>HtmlBot" ],
					"www/prod/v1/<%= pkg.name %>.html.js" : [
							"src/crypto-js/crypto.js",
							"src/mersenne-twister.js",
							"src/<%= pkg.name %>.commons.js",
							"src/<%= pkg.name %>.html.js" ],
					"www/prod/v1/dashboard.html" : "src/dashboard.html"
				}
			},
			cthtml : {
				files : {
					"www/prod/v1/<%= pkg.name %>.html" : [
							"src/<%= pkg.name %>HtmlTop",
							"www/prod/v1/<%= pkg.name %>.html.min.js",
							"src/<%= pkg.name %>HtmlBot" ]
				}
			}
		},
		qunit : {
			all : {
				options : {
					urls : [ "http://cookietrust.org/tests/CtTests.html" ]
				}
			}
		},
		uglify : {
			build : {
				files : {
					"www/prod/v1/<%= pkg.name %>.js" : "www/prod/v1/<%= pkg.name %>.js",
					"www/prod/v1/<%= pkg.name %>.html.min.js" : "www/prod/v1/<%= pkg.name %>.html.js"
				}
			}
		},
		aws : grunt.file.readJSON('aws-keys.json'),
		aws_s3 : {
			options : {
				accessKeyId : "<%= aws.AWSAccessKeyId %>",
				secretAccessKey : "<%= aws.AWSSecretKey %>",
				region : "us-east-1"
			},
			deploy : {
				options : {
					bucket : "cookietrust-prod",
					access : "public-read",
					params : {
						CacheControl : "max-age=86400, public"
					}
				},
				files : [ {
					expand : true,
					cwd : "www/prod/v1",
					src : [ "ct.html", "ct.js", "dashboard.html", "ct.html.min.js" ],
					dest : "prod/v1/"
				} ]
			}
		},
		watch: {
			src: {
				files: ['<%= src/**'],
				tasks: ['default']
			}
		},
		server: {
			test: {
				root: __dirname + '/www',
				port: 80 
			}
		}
	});

	// Load plugins.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-qunit");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks('grunt-aws-s3');
	grunt.loadTasks('./tasks');

	// Default task(s).
	grunt.registerTask("default", [ "clean", "jshint", "concat:ctjs",
			"qunit" ]);
	grunt.registerTask("build", [ "clean", "jshint", "concat:ctjs",
			"qunit", "uglify", "concat:cthtml" ]);
	grunt.registerTask("deploy", [ "clean", "jshint", "concat:ctjs",
			"uglify", "concat:cthtml", "aws_s3" ]);
	grunt.registerTask('dev', [
		'clean', 
		'jshint', 
		'concat:ctjs',
		'server',
		'watch'
	]);

};
