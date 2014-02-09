CT v1 JS API
====

Cookie Trust v1

https://github.com/samtingleff/js-api

## Development
- Add example.com and cdn.cookietrust.org to your hosts file and have them point to 127.0.0.1
- Install NodeJS
- Execute `npm install -g grunt-cli` to install Grunt
- Execute `echo "{}" >> aws-keys.json`
- Clone this repository
- Execute `npm install` at the root of the repository
- Execute `grunt dev`
- Go to http://example.com

Note that as you modify the files in src, the build engine will automatically rebuild the static files.

## Production Deployment
- Create a file aws-keys.json like
```{
 "AWSAccessKeyId":"foo",
 "AWSSecretKey":"bar"
}```
- Execute "grunt deploy"

## Tests
- You'll need to first run through the 'Development' steps to run the tests
- Tests are executed against PhantomJS whenever executing a grunt task (such as the default one when executing `grunt`)
- Your can also manually run the tests on any browser after executing `grunt dev` by going to http://cdn.cookietrust.org/tests/CtTests.html

## Runtime Development Utilities:
- http://cdn.cookietrust.org/utilities/clearLocalStorage.html
- http://cdn.cookietrust.org/utilities/addCookie.html?r=CookieTrust.debug.ON
- http://cdn.cookietrust.org/utilities/deleteCookie.html?r=CookieTrust.debug.ON

