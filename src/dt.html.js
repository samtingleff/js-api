var IframeDigiTrust = IframeDigiTrust || (function () {

 var I = {};

 var identityRequestStack = 0;

 var parentDomain = document.referrer ? document.referrer.split("//")[0]+"//"+document.referrer.split("/")[2] : null;

 /**
  * Opt out user by opt-out domain.
  */
 var optOut = I.optOut = function () {
  console.log("DigiTrustIframe.optOut");
  var identity = DigiTrustCommons.readLocalIdentity({cookies:true});
  var time = new Date().getTime();
  // create one if null
  if (!identity) {
   identity = {
    "id": DigiTrustCommons.dtOptOutId,
    "domain": "digitru.st",
    "created": time,
    "modified": time,
    "lastRead": time,
    "privacy": {
     "optout": false
    }
   };
  }

  // set the opt out flag
  identity.privacy.optout = true;
  // re-write to cookies
  DigiTrustCommons.writeLocalIdentity(identity, {cookies:true, domain:identity.domain});
  return identity;
 };

 /**
  * Opt in.
  */
 var optIn = I.optIn = function () {
  console.log("DigiTrustIframe.optIn");
  var identity = DigiTrustCommons.readLocalIdentity({cookies:true});
  var time = new Date().getTime();
  // create one if null
  if (!identity) {
   identity = {
    "id": DigiTrustCommons.dtOptOutId,
    "domain": "digitru.st",
    "created": time,
    "modified": time,
    "lastRead": time,
    "privacy": {
     "optout": false
    }
   };
  }

  // unset the opt out flag
  identity.privacy.optout = false;
  // re-write to cookies
  DigiTrustCommons.writeLocalIdentity(identity, {cookies:true, domain:identity.domain});
  return identity;
 };

 /**
  * Route postMessage events based on "type" field
  */
 var messageRouter = I.messageRouter = function (event) {
  console.log("DigiTrustIframe.messageRouter");
  console.log("event:");
  console.log(event);
  if (false === (event.origin === parentDomain)) {
   console.log("invalid origin");
   return;
  }
  try {
   var msg = JSON.parse(event.data);
   console.log(msg);
   if (DigiTrustCommons.dtIframeIdentityRequestRoute === msg.type) {
    console.log("routing to I.identityRequest");
    I.identityRequest(event);
   } else {
    console.log("routing error");
   }
  } catch(err) {
   console.log(err);
  }
 };

 /**
  * An identity requested from parent frame.
  */
 var identityRequest = I.identityRequest = function(event) {
  console.log("DigiTrustIframe.identityRequest()");
  console.log(event);
  ++identityRequestStack;
  var identity = DigiTrustCommons.readLocalIdentity({cookies:true, write:true});
  console.log("local identity");
  console.log(identity);
  // update read time
  if (identity !== null) {
   console.log("identity present in local namespace");
   sendIdentityResponse(identity);
  } else {
   DigiTrustCommons.loadJS(DigiTrustConfig.dtIdentityCreateURl,
     function() {
      // no-op
     },
     function(err) {
      console.log("failed");
      sendMessageToParent({
        "id": Math.floor(Math.random()*10000000),
        "version": 1,
        "type": DigiTrustCommons.dtIframeIdentityResponseRoute,
        "value":{
         "success":false,
         "error": err
        }});
     });
  }
 };

 var sendIdentityResponse = I.sendIdentityResponse = function(identity) {
  while (identityRequestStack > 0) {
   console.log("stack: " + identityRequestStack);
   identityRequestStack = 0;
   // explicitly set fields in the response identity to avoid leaking info
   sendMessageToParent({
    "id": Math.floor(Math.random()*10000000),
    "version": 1,
    "type": DigiTrustCommons.dtIframeIdentityResponseRoute,
    "value":{
     "success": true,
     "identity": {
      "id": identity.id,
      "version": identity.version,
      "domain": identity.domain,
      "created": identity.created,
      "modified": identity.modified,
      "lastRead": identity.lastRead,
      "privacy":{
       "optout": identity.privacy.optout
      }
     }
    }
   });
  }
 };
 
 /**
  * Called by jsonp response from a remote identity request.
  *
  * Writes the received value and sends an event.
  */
 var remoteIdentityReceived = I.remoteIdentityReceived = function(remoteIdentity) {
  console.log("IframeDigiTrust.remoteIdentityReceived()");
  console.log(remoteIdentity);
  // look for an existing identity
  var identity = DigiTrustCommons.readLocalIdentity();
  // if none found, write the received value
  if (identity === null) {
   identity = remoteIdentity;
   //DigiTrustCommons.writeLocalIdentity(identity, {cookies:true});
  }
  sendIdentityResponse(identity);
 };

 var sendMessageToParent = I.sendMessageToParent = function(message) {
  console.log("DigiTrustIframe.sendMessageToParent");
  console.log(parentDomain);
  parent.postMessage(JSON.stringify(message), parentDomain);
 };

 var createIframeReadyMessage = I.createIframeReadyMessage = function(memberId, token) {
  console.log("DigiTrustIframe.createIframeReadyMessage()");
  var ready = {
    "id": Math.floor(Math.random()*10000000),
    "version": 1,
    "type": DigiTrustCommons.dtIframeReadyRoute };
  console.log("returning: " + JSON.stringify(ready));
  return ready;
 };

 return I;
}());
