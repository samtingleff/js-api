module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg : grunt.file.readJSON("package.json"),
		deployment : grunt.file.readJSON('deployment-config.json'),
		clean : [ "www/prod/v1/*", "src/*.min.*" ],
		jshint : {
			all : [ "Gruntfile.js", "src/<%= pkg.name %>.js",
					"src/<%= pkg.name %>.html.js" ]
		},
		replace : {
			ctconfig : {
				src : [ "config/<%= pkg.name %>.config.js" ],
                                dest : "src/",
                                replacements : [{
                                        from : "${iframe.origin}",
                                        to : "<%= deployment.iframeOrigin %>"
                                }, {
                                        from : "${iframe.source}",
                                        to : "<%= deployment.iframeSource %>"
                                }, {
                                        from : "${usage.pixel.source}",
                                        to : "<%= deployment.usagePixelSource %>"
                                }, {
                                        from : "${identity.create.source}",
                                        to : "<%= deployment.identityCreateSource %>"
                                }]
			},
			scriptConfig : {
				src : [ "src/dashboard.html" ],
				dest : "www/prod/v1/",
                                replacements : [{
                                        from : "${script.source}",
                                        to : "<%= deployment.scriptSource%>"
                                }, {
                                        from : "${iframe.script.source}",
                                        to : "<%= deployment.iframeScriptSource%>"
                                }]
			}
                },
                removelogging : {
			ctjs : {
				src : "www/prod/v1/*.js"
			}
                },
		concat : {
			ctjs : {
				files : {
					"www/prod/v1/<%= pkg.name %>.js" : [
							"src/<%= pkg.name %>.config.js",
							"src/<%= pkg.name %>.commons.js",
							"src/<%= pkg.name %>.b64.js",
							"src/<%= pkg.name %>.js" ],
					"www/prod/v1/<%= pkg.name %>.html" : [
							"src/<%= pkg.name %>HtmlTop",
							"src/<%= pkg.name %>.b64.js",
							"src/<%= pkg.name %>.config.js",
							"src/<%= pkg.name %>.commons.js",
							"src/<%= pkg.name %>.html.js",
							"src/<%= pkg.name %>HtmlBot" ],
					"www/prod/v1/<%= pkg.name %>.html.js" : [
							"src/<%= pkg.name %>.b64.js",
							"src/<%= pkg.name %>.config.js",
							"src/<%= pkg.name %>.commons.js",
							"src/<%= pkg.name %>.html.js" ]
				}
			},
			cthtml : {
				files : {
					"www/prod/v1/<%= pkg.name %>.html" : [
							"src/<%= pkg.name %>HtmlTop",
							"www/prod/v1/<%= pkg.name %>.html.min.js",
							"src/<%= pkg.name %>HtmlBot" ],
					"www/prod/v1/dashboard.html" : "src/dashboard.html",
					"www/prod/v1/forms.css" : "src/forms.css"
				}
			}
		},
		qunit : {
			all : {
				options : {
					urls : [ "http://cdn.digitru.st/tests/DTTests.html" ]
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
		aws_s3 : {
			options : {
				accessKeyId : "<%= deployment.AWSAccessKeyId %>",
				secretAccessKey : "<%= deployment.AWSSecretKey %>",
				region : "us-east-1"
			},
			deploy : {
				options : {
					bucket : "<%= deployment.bucket %>",
					access : "public-read",
					params : {
						CacheControl : "max-age=86400, public"
					}
				},
				files : [ {
					expand : true,
					cwd : "www/prod/v1",
					src : [ "dt.html", "dashboard.html", "forms.css", "dt.js", "dashboard.html", "dt.html.js", "dt.html.min.js" ],
					dest : "<%= deployment.env %>/v1/"
				},
				{
					expand : true,
					cwd : "www/tests",
					src : [ "DTTests.html" ],
					dest : "tests/"
				} ]
			}
		},
		watch: {
			src: {
				files: ['src/**'],
				tasks: ['jshint', 'concat:ctjs']
			}
		},
		server: {
			test: {
				root: __dirname + '/www',
				port: 9001
			}
		}
	});

	// Load plugins.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-text-replace");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-qunit");
	grunt.loadNpmTasks("grunt-remove-logging");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks('grunt-aws-s3');
	grunt.loadTasks('./tasks');

	// Default task(s).
	grunt.registerTask('default', ['build-unminified']);

	grunt.registerTask('build-unminified', [
		'clean',
		'replace',
		'jshint',
		'concat:ctjs',
		'server', 
		'qunit'
	]);

	grunt.registerTask('build', [
		'build-unminified',
                'removelogging',
		'uglify', 
		'concat:cthtml',
		'replace'
	]);

	grunt.registerTask('dev', [
		'build-unminified',
		'watch'
	]);
	
	grunt.registerTask('deploy', [ 'build', 'aws_s3']);
};
