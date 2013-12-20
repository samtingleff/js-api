/*
 CookieTrustJS 0.1.0
 */

var CookieTrustCommons = CookieTrustCommons || (function () {
	
	var M = {};

	var utilities = M.utilities = {};
	
	/**
	 * CT key
	 */
	var ctIdKey = M.ctIdKey = "CookieTrust.Identity.v1";
	
	var ctIframeReadyRoute = M.ctIframeReadyRoute = "CookieTrust.iframe.v1.ready";

	var ctIframeClearLSRoute = M.ctIframeClearLSRoute = "CookieTrust.iframe.v1.clearLS";

	var ctIframeSetLSRoute = M.ctIframeSetLSRoute = "CookieTrust.iframe.v1.setLS";
	
	var ctIdentityResponseRoute = M.ctIdentityResponseRoute = "CookieTrust.Identity.v1.response";

	var ctIdentityRequestRoute = M.ctIdentityRequestRoute = "CookieTrust.Identity.v1.request";
	
	/**
	 * CT debug on key
	 */
	var ctDebugOnKey = M.ctDebugOnKey = "CookieTrust.debug.ON";
	
	/**
	 * Gets the value of the cookie identified by cookieName.
	 * 
	 * @param {string} cookieName
	 * 
	 */
	var getCookieValue = M.utilities.getCookieValue = function (cookieName) {
		var value = null;
		var cookiesParts = document.cookie.split(cookieName + "=");
		if (cookiesParts.length === 2) {
			value = cookiesParts.pop().split(";").shift();
		}
		return value;
	};
	
	/**
	 * Console.log wrapper.
	 * 
	 * @param {string} message
	 * 
	 */
	var consoleDebugLog = M.utilities.consoleDebugLog = function (message) {
		if (getCookieValue(ctDebugOnKey) && window.console) {
				window.console.log(message);
		}
	};
	
	var getPostMessageListener = M.utilities.getPostMessageListener = function (callback) {
		//Create browser compatible event handler
		var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
		var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
		var eventHandler = window[eventMethod];
		return function () {
			eventHandler(messageEvent, callback, false);
		};
	}; 

	/**
	 * Backward compatible json parser. This implementation service 2 purposes: 
	 *
	 *   1. On browsers without JSON.parse, return empty JSON object.
	 *   2. If the input is an already-parsed JSON object, return input unmodified, otherwise parse the input into JSON.
	 *
	 * @param string or json object.
	 * 
	 */
	var safeJsonParse = M.utilities.safeJsonParse = (function(JSON) {
		var safeJsonParse = null;
		// Return empty object if JSON.parse is not on this browser
		if (JSON && typeof(JSON.parse) == 'function') {
			safeJsonParse = function(strOrJson) {
				return typeof(strOrJson) == 'object' ? strOrJson : JSON.parse(strOrJson);
			};
		} else {
			safeJsonParse = function(strOrJson) {
				return typeof(strOrJson) == 'object' ? strOrJson : {};
			};
		}
		return safeJsonParse;
	})(JSON);

	return M;

}());
