ctv1
====

Cookie Trust v1

https://github.com/samtingleff/js-api

Deployment:
- You will need to run grunt to build the project.
- Execute the following in the same directory as your Gruntfile.js:

  - npm install
  - echo "{}" >> aws-keys.json
 
- Please add the following to your hosts file:

  - [Web Server IP]		example.com	cdn.cookietrust.org

- The web server document root should point to www/
    - You may use python's simple http server: 
      - cd ~/ctv1/www && sudo python -m SimpleHTTPServer 80

Production Deployment
- Create a file aws-keys.json like
{
 "AWSAccessKeyId":"foo",
 "AWSSecretKey":"bar"
}
- Execute "grunt deploy"

Tests:

- http://cdn.cookietrust.org/tests/CtTests.html

Utilities:

- http://cdn.cookietrust.org/utilities/clearLocalStorage.html

- http://cdn.cookietrust.org/utilities/addCookie.html?r=CookieTrust.debug.ON

- http://cdn.cookietrust.org/utilities/deleteCookie.html?r=CookieTrust.debug.ON

