var DigiTrustCommons = DigiTrustCommons || (function () {
 var I = {};

 var dtIdKey = I.dtIdKey = "DigiTrust.Identity.v1";

 var dtMaxCookieAge = I.dtMaxCookieAge = (60*60*24);

 var dtIframeReadyRoute = I.dtIframeReadyRoute = "DigiTrust.iframe.ready";

 var dtIframeIdentityRequestRoute = I.dtIframeIdentityRequestRoute = "DigiTrust.Identity.request";

 var dtIframeIdentityResponseRoute = I.dtIframeIdentityResponseRoute = "DigiTrust.Identity.response";

 var dtOptOutId = I.dtOptOutId = "optout";

 /**
  * Read an identity from html 5 local storage or cookies.
  *
  * Returns null if nothing found.
  */
 var readLocalIdentity = I.readLocalIdentity = function(args) {
  console.log("DigiTrustCommons.readLocalIdentity()");
  console.log(args);
  var identity = null;
  if (!(args && (args.cookies === false))) {
   identity = readLocalIdentityFromCookies();
  }
  if (identity !== null) {
   identity.lastRead = new Date().getTime();
   if (args && args.write) {
    writeLocalIdentity(identity, {cookies:true});
   }
  }
  console.log("readLocalIdentity() returning:");
  console.log(identity);
  return identity;
 };

 var readLocalIdentityFromCookies = I.readLocalIdentityFromCookies = function(args) {
  console.log("DigiTrustCommons.readLocalIdentityFromCookies()");
  var identity = null;
  var encoded = getCookieValue(dtIdKey);
  console.log("cookie value: " + encoded);
  if (encoded !== null) {
   try {
    console.log(encoded);
    var decoded = DigiTrustB64.decode(decodeURIComponent(encoded));
    identity = JSON.parse(decoded);
   } catch(err) {
    console.log(err);
   }
  }
  return identity;
 };

 var writeLocalIdentity = I.writeLocalIdentity = function(identity, args) {
  console.log("DigiTrustCommons.writeLocalIdentity()");
  console.log(identity);
  console.log(args);
  if (!(args && (args.cookies === false))) {
   var serializedIdentity = encodeURIComponent(DigiTrustB64.encode(JSON.stringify(identity)));
   var cookieStr = DigiTrustCommons.dtIdKey +
     "=" + serializedIdentity + "; " +
     "max-age=" + DigiTrustCommons.dtMaxCookieAge + "; " +
     "path=/";
   if (identity && identity.domain) {
    cookieStr = cookieStr + "; domain=" + identity.domain;
   }
   document.cookie = cookieStr;
  }
 };

 var submitUsageEvent = I.submitUsageEvent = function(identity, member, token) {
  console.log("DigiTrustCommons.submitUsageEvent()");
  var url = DigiTrustConfig.dtUsagePixelSource +
    "?member=" + encodeURIComponent(member);
  if (token) {
   url = url + "&token=" + encodeURIComponent(token);
  }
  url = url + "&dtid=";
  if (identity && identity.id) {
   url = url + identity.id;
  }
  var oImg = document.createElement("img");
  if (token) {
   oImg.setAttribute("id", "DigiTrust:" + token);
  }
  oImg.setAttribute("src", url);
  oImg.style.display = "none";
  oImg.width = "0";
  oImg.height = "0";
  document.body.appendChild(oImg);
 };

 /**
  * Read the value of a given cookie.
  */
 var getCookieValue = I.getCookieValue = function (cookieName) {
  var value = null;
  var cookiesParts = document.cookie.split(cookieName + "=");
  if (cookiesParts.length >= 2) {
   value = cookiesParts.pop().split(";").shift();
  }
  return value;
 }

 /**
  * Register a callback for iframe postMessage events.
  */
 var getPostMessageListener = I.getPostMessageListener = function (callback) {
  console.log("getPostMessageListener()");
  //Create browser compatible event handler
  var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
  var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
  var eventHandler = window[eventMethod];
  return function () {
   eventHandler(messageEvent, callback, false);
  };
 };

 var loadJS = I.loadJS = function (src, successCallback, errorCallback) {
  var s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.onerror = function() {
   errorCallback();
  };
  s.onreadystatechange = s.onload = function() {
   var state = s.readyState;
   if (!successCallback.done && (!state || /loaded|complete/.test(state))) {
    successCallback.done = true;
    successCallback();
   }
  };
  document.getElementsByTagName('head')[0].appendChild(s);
 }

 return I;
}());
