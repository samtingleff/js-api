/*
CookieTrustJS 0.1.0
*/

var IframeCookieTrust = IframeCookieTrust || (function () {

	var I = {};

	var parentDomain = document.referrer ? document.referrer.split("//")[0]+"//"+document.referrer.split("/")[2] : null;
	
	// Listen to message from parent window.
	CookieTrustCommons.utilities.getPostMessageListener(function (event) {
		if (window.JSON) {
			var route;
			var data;
			var value;
			var ctid;
			if (event.origin === parentDomain) {
				data =  CookieTrustCommons.utilities.safeJsonParse(event.data);
				route = data.route;
				value = data.value;
				CookieTrustCommons.utilities.consoleDebugLog("CTHTML received: " + JSON.stringify(route));
				ctid = null;
				if (route === CookieTrustCommons.ctIdentityRequestRoute) {
					if ("localStorage" in window && window.localStorage !== null) {
						// Check cdn.cookietrust.org's local storage for Ctid.
						ctid = getIdentityFromLocalStorage(); 
						CookieTrustCommons.utilities.consoleDebugLog(ctid ? "Ctid found in cookietrust.org's localStorage!" : "Ctid found not found in cookietrust.org's localStorage.");
						if (!ctid) {
							// Generate GUID and store in localStorage
							ctid = createIdentity();
						}
						sendMessageToParent(createIdentityResponseMessage(ctid));
					}
				} else if (route === CookieTrustCommons.ctIframeClearLSRoute) {
					if ("localStorage" in window && window.localStorage !== null) {
						window.localStorage.clear();
					}	
				}  else if (route === CookieTrustCommons.ctIframeSetLSRoute) {
                                        if ("localStorage" in window && window.localStorage !== null) {
                                                window.localStorage[CookieTrustCommons.ctIdKey] = value;
                                        }
                                }
			}
		}
	})();
	
	var seedArray = function () {
		if (window && window.crypto && window.crypto.getRandomValues) {
			var arr = new Int32Array(8);
			window.crypto.getRandomValues(arr);
			return arr;
		} else {
			var date = new Date(); 
			var stringToHash = 
				document.referrer + 
				date.getTime() +
				date.getTimezoneOffset() +
				navigator.userAgent + 
				Math.random() +
				window.screen.availHeight + 
				window.screen.availWidth;
			return CryptoJS.SHA256(stringToHash).words;
		}
	};
	
	var m = new MersenneTwister();
	console.log(10,  window.crypto.getRandomValues(new Int32Array(8)));
	m.init_by_array(seedArray(), 8);
	console.log(20);
	var getIdentityFromLocalStorage =  function () {
		var ctidObject = null;
		var ctidObjectInLocalStorage = null;
		if (localStorage[CookieTrustCommons.ctIdKey]) {
			// Found something in localStorage
			try {
				ctidObjectInLocalStorage = CookieTrustCommons.utilities.safeJsonParse(localStorage[CookieTrustCommons.ctIdKey]);
				if ("id" in ctidObjectInLocalStorage &&  "preference" in ctidObjectInLocalStorage) { 
					ctidObject = ctidObjectInLocalStorage;
				}
			}
			catch(e) {
				CookieTrustCommons.utilities.consoleDebugLog("ctid is corrupted.");
			}
		}
		return ctidObject; 
	};
	
	var createIdentity = I.createIdentity = function () {
		CookieTrustCommons.utilities.consoleDebugLog("Creating new identity.");
		/* The line below is for IE 8 compatibility */
		Date.now = Date.now || function() { return new Date().valueOf(); };
		var now = Math.round(Date.now() / 1000);
		var ctid = {
				id: createRandomId(),
				secret: createRandomSecret(),
				preference: 0,
				created: now, 
				modified: now
		}; 
		localStorage[CookieTrustCommons.ctIdKey] = JSON.stringify(ctid);
		return ctid;
	};
	
	var createRandomSecret = function (nwords) {
		// TODO: Return a better secret;
		return CryptoJS.SHA256(navigator.userAgent).toString();
	};
	
	var createRandomId = function () {
		var max64Uint = [1, 8, 4, 4, 6, 7, 4, 4, 0, 7, 3, 7, 0, 9, 5, 5, 1, 6, 1, 5];
		var currentDigit = 0;
		var randomId = "";
		while (currentDigit < max64Uint.length) {
			var value = Math.floor(m.genrand_res53() * (max64Uint[currentDigit] + 1));
			randomId += value;
			if (value < max64Uint[currentDigit]) {
				return (randomId + getRandomDigits(max64Uint.length - currentDigit - 1)).replace(/^0+/, ''); 
			}
			currentDigit++;
		}
	};
	
	var getRandomDigits = function (length) {
		var randRes53 = m.genrand_res53();
		var randRes53Length = ("" + randRes53).length - 2;
		if (length < randRes53Length) {
			return Math.floor(Math.pow(10, length) * randRes53);
		}
		else {
			return Math.floor(Math.pow(10, randRes53Length) * randRes53) + 
				Math.floor(Math.pow(10, length - randRes53Length) * m.genrand_res53());
		}
	};
	
	var setIdentityPreference = I.setIdentityPreference = function (preference) {
		ctid = localStorage[CookieTrustCommons.ctIdKey];
		if (!ctid) {
			ctid = createIdentity();
		}
		var ctidObject = CookieTrustCommons.utilities.safeJsonParse(ctid);
		if ("preference" in ctidObject) {
			ctidObject.preference = preference ? 1 : 0;
			/* The line below is for IE 8 compatibility */
			Date.now = Date.now || function() { return new Date().valueOf(); };
			ctidObject.modified = Math.round(Date.now() / 1000);
			localStorage[CookieTrustCommons.ctIdKey] = JSON.stringify(ctidObject);
		}
	};
	
	var sendMessageToParent = I.sendMessageToParent = function (message) {
		parent.postMessage(JSON.stringify(message), parentDomain);
	}; 

	var createIdentityResponseMessage = function(identityObject) {
		var response = {};
		response.route = CookieTrustCommons.ctIdentityResponseRoute;
		response.value = identityObject;
		// Remove secret
		delete(response.value.secret);
		CookieTrustCommons.utilities.consoleDebugLog("CTHTML sent: " + JSON.stringify(response));
		return response;
	};

	var createIframeReadyMessage = I.createIframeReadyMessage = function () {
		var ready = {};
		ready.route = CookieTrustCommons.ctIframeReadyRoute;
		CookieTrustCommons.utilities.consoleDebugLog("CTHTML sent: " + JSON.stringify(ready));
		return ready;
	};

	return I;
}());
