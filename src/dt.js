var DigiTrust = DigiTrust || (function() {
 var I = {};

 var childFrame = null;

 var identityListeners = I.identityListeners = [];

 var getIdentityAsync = I.getIdentityAsync = function(args, callback) {
  console.log("inside DigiTrust.getIdentityAsync()");
  var returned = false;
  var identity = DigiTrustCommons.readLocalIdentity({cookies:true});
  if (identity !== null) {
   returned = true;
   I.identityListeners.push({"called":true, "member":args.member, "token":args.token, callback:null});
   callback({
    "success":true,
    "identity":identity
   });
  }
  if (false === returned) {
   I.identityListeners.push({"called":false, "member":args.member, "token":args.token, callback:callback});
  }
  // TODO: do not know why this seems to be required here
  DigiTrustCommons.getPostMessageListener(I.messageRouter)();
  // spawn an iframe to communicate with digitru.st
  var myChildFrame = spawnIframe();
 };

 var getIdentitySync = I.getIdentitySync = function(args, callback) {
  console.log("inside DigiTrust.getIdentitySync()");
  var identity = DigiTrustCommons.readLocalIdentity({cookies:true});
  var response = {
   "success": (identity),
   "identity": identity
  };
  // TODO: do not know why this seems to be required here
  DigiTrustCommons.getPostMessageListener(I.messageRouter)();
  // spawn an iframe to communicate with digitru.st
  var myChildFrame = spawnIframe();
  DigiTrustCommons.submitUsageEvent(identity, args.member, args.token);
  return response;
 };

 var messageRouter = I.messageRouter = function(event) {
  console.log("DigiTrust.messageRouter()");
  console.log(event);
  // validate origin
  if (false === (event.origin === (document.location.protocol + DigiTrustConfig.dtIframeOrigin))) {
   console.log("invalid origin");
   return;
  }

  try {
   var msg = JSON.parse(event.data);
   console.log(msg);
   console.log("trying to route from: " + msg.type);
   if (DigiTrustCommons.dtIframeReadyRoute === msg.type) {
    console.log("routing to childFrameReadyMessageReceived");
    childFrameReadyMessageReceived(event);
   } else if (DigiTrustCommons.dtIframeIdentityResponseRoute === msg.type) {
    console.log("routing to childFrameIdentityMessageReceived");
    childFrameIdentityMessageReceived(event);
   } else {
    console.log("routing failure");
    console.log("msg.type: " + msg.type);
   }
  } catch(err) {
   console.log(err);
  }
 };

 var childFrameReadyMessageReceived = I.childFrameReadyMessageReceived = function(event) {
  console.log("DigiTrust.childFrameReadyMessageReceived()");
  // ask for an identity
  event.source.postMessage(
    JSON.stringify({"version":1, "type":DigiTrustCommons.dtIframeIdentityRequestRoute}),
    document.location.protocol + DigiTrustConfig.dtIframeOrigin);
  console.log("posted message to child");
 };

 var childFrameIdentityMessageReceived = I.childFrameIdentityMessageReceived = function(event) {
  console.log("DigiTrust.childFrameIdentityMessageReceived()");
  var identity = null;
  var identityMessageEventSource = event.source;
  var msg = JSON.parse(event.data);
  if (msg.value && (msg.value.success === true)) {
   // write to cookies
   identity = msg.value.identity;
   DigiTrustCommons.writeLocalIdentity(identity, {cookies:true});
  }
  // send to all listeners
  var listener = I.identityListeners.pop();
  while (listener) {
   if (!listener.called) {
    try {
     listener.called = true;
     listener.callback(msg.value);
    } catch(err) { console.log(err); }
   }
   // send a usage event
   DigiTrustCommons.submitUsageEvent(identity, listener.member, listener.token);
   listener = I.identityListeners.pop();
  }
 };

 var spawnIframe = I.spawnIframe = function() {
  if (childFrame === null) {
   var newChildFrame = document.createElement("iframe");
   newChildFrame.setAttribute("id", Math.floor(Math.random()*10000000));
   newChildFrame.setAttribute("src", DigiTrustConfig.dtIframeSource);
   newChildFrame.style.display = "none";
   document.body.appendChild(newChildFrame);
   childFrame = I.childFrame = newChildFrame;
  }
  return childFrame;
 };

 // register messageRouter for postMessage events
 DigiTrustCommons.getPostMessageListener(I.messageRouter)();

 return I;
}());
