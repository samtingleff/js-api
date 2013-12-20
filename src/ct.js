/*
 CookieTrustJS 0.1.0
 */

var CookieTrust = CookieTrust || (function () {
	
	var C = {};

	var utilities = C.utilities = {};

	var ctDomain = C.ctDomain = "http://cdn.cookietrust.org";  

	var ctIframeSource = ctDomain + "/prod/v1/ct.html"; 
	
	var ctIframeIsReady = false;
	
	var ctIframe = null;
	
	var parametersForGetIdentityCalls = [];
	
	var parametersForGetIdentityResponses = [];

	var Identity = C.Identity = {
		/**
		 * Gets ct identity, first from first party cookie, then from localStorage (ct iframe) 
		 * and finally from ct backend.
		 * 
		 * If the identity is found in the first party cookie, it immediately returns it; otherwise the callback method,
		 * if provided, asynchronously handles the identity returned by the CTIframe.
		 * 
		 * @param {string} partner
		 * 
		 * @param {function} callback
		 * 
		 * @param {function} errback
		 *
		 * @return {Object} The identity object.
		 *
		 * @example
		 *
		 *     var id = CookieTrust.Identity.getIdentity("X8olx5NLja");
		 *
		 */
		getIdentity : function (partner, callback, errback) {
			var ctidObject = null;
			var call = {};
			var response = {};
			if (partner) { 
				try {
					if (window.JSON) {
						CookieTrustCommons.utilities.consoleDebugLog("Getting Ctid for partner " + partner);
						CookieTrustCommons.utilities.consoleDebugLog("Looking for identity in first party cookies...");
						ctidObject = getIdentityFromDomainCookies();
						if (!ctidObject) { 
							CookieTrustCommons.utilities.consoleDebugLog("Ctid not found in first party cookies; checking CT iframe...");
							if (ctIframe && ctIframeIsReady) {
								// Send requests immediately
								sendMessageToCTIframe(ctIframe.contentWindow, CookieTrustCommons.ctIdentityRequestRoute, partner, errback);
							}
							else {
								call.parameters = {"partner": partner};
								call.errback = errback;
								parametersForGetIdentityCalls[parametersForGetIdentityCalls.length] = call;
								insertCTIframe(); 
							}
							response.callback = callback;
							response.errback = errback;
							parametersForGetIdentityResponses[parametersForGetIdentityResponses.length] = response;
						}
						else {
							call.parameters = {"partner": partner};
							parametersForGetIdentityCalls[parametersForGetIdentityCalls.length] = call;
							insertCTIframe();
						}
					}
				}
				catch (e) {
					CookieTrustCommons.utilities.consoleDebugLog("Something went wrong.");
					if (errback) {
						errback();
					}
				}
			}
			else {
				CookieTrustCommons.utilities.consoleDebugLog("Missing required parameter: partner");
				if (errback) {
					errback();
				}
			}
			return ctidObject;
		}
	};
	
	var getIdentityFromDomainCookies = C.utilities.getIdentityFromDomainCookies = function () {
		var ctidObject = null;
		var objectInCookie = null;
		var ctid = CookieTrustCommons.utilities.getCookieValue(CookieTrustCommons.ctIdKey);
		if (ctid) {
			// Found something in cookies
			try {
				objectInCookie = CookieTrustCommons.utilities.safeJsonParse(CryptoJS.enc.Base64.parse(ctid).toString(CryptoJS.enc.Utf8));
				if ("id" in objectInCookie && "preference" in objectInCookie) { 
					CookieTrustCommons.utilities.consoleDebugLog("Ctid found in first party cookies!");
					ctidObject = objectInCookie;
					CookieTrustCommons.utilities.consoleDebugLog(JSON.stringify(ctidObject));
				}
				else {
					CookieTrustCommons.utilities.consoleDebugLog("First party cookie is missing id or preference.");
				}
			}
			catch (e) {
				CookieTrustCommons.utilities.consoleDebugLog("First party cookie is corrupted.");
			}
		}
		return ctidObject; 
	};

	var clearLocalStorage = C.utilities.clearLocalStorage = function () {
		if (ctIframe && ctIframeIsReady) {
			sendMessageToCTIframe(ctIframe.contentWindow, CookieTrustCommons.ctIframeClearLSRoute, "", null);
                }
	};

	var setLocalStorage = C.utilities.setLocalStorage = function (value) {
		if (ctIframe && ctIframeIsReady) {
                        sendMessageToCTIframe(ctIframe.contentWindow, CookieTrustCommons.ctIframeSetLSRoute, value, null);
                }	
	};
	
	/**
	 * Set the identity cookie
	 */
	var setIdentityCookie = C.utilities.setIdentityCookie = function (ctid, ttl) {
		if (!ttl) {
			// Cookie default TTL is 1 month; 30 days * 24 hours * 3600 seconds * 1000 miliseconds
			ttl = 30 * 24 * 3600 * 1000;
		}
		var now = new Date();
		var time = now.getTime();
		var expireTime = time + ttl;
		now.setTime(expireTime);
		document.cookie = CookieTrustCommons.ctIdKey + 
			"=" + CryptoJS.enc.Utf8.parse(JSON.stringify(ctid)).toString(CryptoJS.enc.Base64) + 
			";expires=" + now.toGMTString() + 
			";path=/";
	};

	/**
	 * Insert CTIframe into page.
	 */
	var insertCTIframe = C.utilities.insertCTIframe = function () {
		if (!ctIframe) {
			ctIframe = document.createElement("iframe");
			ctIframe.setAttribute("id", CryptoJS.lib.WordArray.random(16).toString());
			ctIframe.setAttribute("src", ctIframeSource);
			ctIframe.style.display = "none";
			document.body.appendChild(ctIframe);
			CookieTrustCommons.utilities.consoleDebugLog("Created 0x0 iframe sourcing from " + ctIframeSource);
		}
		return ctIframe;
	};

	/**
	 * Send message to CTIframe
	 * 
	 * @param {object} iframe
	 *
	 * @param {string} route
	 * 
	 * @param {object} value
	 * 
	 * 
	 */
	var sendMessageToCTIframe = C.utilities.sendMessageToCTIframe = function (iframeSource, route, value, errback) {
		try {
			var request = {};
			request.route = route;
			request.value = value;
			CookieTrustCommons.utilities.consoleDebugLog("CTJS sent: " + JSON.stringify(request));
			iframeSource.postMessage(JSON.stringify(request), ctDomain);
		} 
		catch(e) {
			if (errback) {
				errback(e);
			}
		}
	};

	CookieTrustCommons.utilities.getPostMessageListener(function (event) {
		var data;
		var route;
		var parametersForGetIdentityCall;
		var parametersForGetIdentityResponse;
		var validResponse = false;
		if (event && event.origin) {
			if (event.origin !== ctDomain) {
				return;
			}
			data = CookieTrustCommons.utilities.safeJsonParse(event.data);
			route = data.route;
			CookieTrustCommons.utilities.consoleDebugLog("CTJS received: " + route);
			if (route === CookieTrustCommons.ctIframeReadyRoute) {
				ctIframeIsReady = true;
				while(parametersForGetIdentityCalls.length > 0) {
					// Send requests
					parametersForGetIdentityCall = parametersForGetIdentityCalls.shift();
					sendMessageToCTIframe(event.source, CookieTrustCommons.ctIdentityRequestRoute, parametersForGetIdentityCall.parameters, parametersForGetIdentityCall.errback);
				}	
			}
			else if (route === CookieTrustCommons.ctIdentityResponseRoute && data.value) {
				validResponse = "id" in data.value;
				if (validResponse) {
					setIdentityCookie(data.value);
				}
				while(parametersForGetIdentityResponses.length > 0) {
					parametersForGetIdentityResponse = parametersForGetIdentityResponses.shift();
					// Handle responses:
					if (validResponse) {
						if (parametersForGetIdentityResponse.callback) {
							parametersForGetIdentityResponse.callback(data.value);
						} 
					}
					else if (parametersForGetIdentityResponse.errback) {
						parametersForGetIdentityResponse.errback(data.value);
					}
				}
			}
		}
	})();

	return C;
}());
