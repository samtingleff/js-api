var express = require('express');

module.exports = function(grunt){
	grunt.registerMultiTask('server', 'Test server', function(){
		var done = this.async();
		var data = this.data;
		var app = express();
		app.use('/', express.static(data.root));
		app.listen(data.port, data.hostname, done)
;	});
};