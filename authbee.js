/*
---
name: Authbee Angularjs

description: Provides an easier way to make use of Authbee API with Angularjs

license: MIT-style license

authors:
  - arkadiusz.putko@gmail.com
  - Authbee

provides: [authbee]

...
*/
(function(window, angular, undefined) {
	'use strict';

	var settings = {};

	angular.module('ngAuthbee', ['ng']).
		provider('authbee', [function authbeeProvider() {
			this.getSettings = function () {
				return this.settings;
			};
			this.init = function (initSettings) {
				// If string is passed, set it as appId
				if (angular.isString(initSettings)) {
					settings.appId = initSettings || settings.appId;
				}

				// If object is passed, merge it with app settings
				if (angular.isObject(initSettings)) {
					angular.extend(settings, initSettings);
				}
			};
			this.$get = authbee;
		}]);

	function authbee($q, $http, $interval, $cookieStore, $rootScope) {
		var AUTHBEE_API = settings.apiAddress;
		var AUTHBEE_APP_ID = settings.appId;

		var getAppData = function() {
	    	return $http.get(AUTHBEE_API + '/fb/' + AUTHBEE_APP_ID + '/url');
	    };
	    var intervalPromise;
	    var facebookLogin = function (params) {
	    	var defer = $q.defer();
	    	var uri = 'https://www.facebook.com/dialog/oauth?display=popup&client_id=' + params.appId +
	    		'&redirect_uri='+ encodeURIComponent(params.facebookCallbackUrl) +
	    		'&response_type=code&scope=' + params.permissions.join(',');
	    	var facebookPopup = window.open(uri, 'signIn', 'width=780,height=410,toolbar=0,scrollbars=0,status=0,resizable=0,location=0,menuBar=0');
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
        eventer(messageEvent,function(e) {
          facebookPopup.close();
          defer.resolve(e.data);
        }, false);
	    	return defer.promise;
	    };
		return {
			login: function () {
	    		var defered = $q.defer();
	    		getAppData().then(function (data) {
	    			facebookLogin(data.data).then(function (user) {
	    				$http.defaults.headers.common['Authorization'] = user.appId + ' ' + user.token; //jshint ignore:line
	    				$cookieStore.put('appId', user.appId);
	    				$cookieStore.put('token', user.token);
	    				$rootScope.user = user;
	    				defered.resolve(user);
	    			}).catch(function (data) {
	    				$interval.cancel(intervalPromise);
	    			});
	    		});

	    		return defered.promise;
	    	},

	    	logout: function () {
	    		var defered = $q.defer();
	    		$http.defaults.headers.common['Authorization'] = ''; //jshint ignore:line
				$cookieStore.remove('appId');
				$cookieStore.remove('token');
				delete $rootScope.user;
				defered.resolve();
	    		return defered.promise;
	    	},

	    	getCurrentGroup: function () {
	    		return this.getGroup($cookieStore.get('group'));
	    	},

	    	getCurrentGroupId: function () {
	    		var defered = $q.defer();
	    		defered.resolve($cookieStore.get('group'));
	    		return defered.promise;
	    	},

	    	getUser: function () {
	    		var defered = $q.defer();
	    		$http.get(AUTHBEE_API + '/cs/me').then(function (data) {
	    			defered.resolve(data.data);
	    		});

	    		return defered.promise;
	    	},

	    	getFbGroups: function () {
	    		var defered = $q.defer();
	    		$http.get(AUTHBEE_API + '/cs/fb/groups').then(function (data) {
	    			defered.resolve(data.data);
	    		});

	    		return defered.promise;
	    	},
	    	getFbGroup: function (id) {
	    		var defered = $q.defer();
	    		$http.get(AUTHBEE_API + '/cs/fb/groups/' + id).then(function (data) {
	    			defered.resolve(data.data);
	    		});

	    		return defered.promise;
	    	},
	    	setFbGroup: function (group) {
	    		var defered = $q.defer();
	    		$http.post(AUTHBEE_API + '/cs/fb/groups/', group).then(function (data) {
	    			$cookieStore.put('group', data.data.id);
	    			defered.resolve(data.data);
	    		});

	    		return defered.promise;
	    	},
	    	getGroups: function () {
	    		var defered = $q.defer();
	    		$http.get(AUTHBEE_API + '/cs/groups/').then(function (data) {
	    			defered.resolve(data.data);
	    		});

	    		return defered.promise;
	    	},
	    	getGroup: function (id) {
	    		var defered = $q.defer();
	    		$http.get(AUTHBEE_API + '/cs/groups/' + id).then(function (data) {
	    			defered.resolve(data.data);
	    		});

	    		return defered.promise;
	    	},
	    	setGroup: function (id) {
	    		var defered = $q.defer();
	    		$cookieStore.put('group', id);
	    		defered.resolve(id);
	    		return defered.promise;
	    	},
	    	getGroupMembers: function (id) {
	    		if (!id) {
	    			id = $cookieStore.get('group');
	    		}
	    		var defered = $q.defer();
	    		$http.get(AUTHBEE_API + '/cs/groups/' + id).then(function (data) {
	    			defered.resolve(data.data.members);
	    		});

	    		return defered.promise;
	    	},
	    	notifyGroup: function (message, id) {
	    		if (!id) {
	    			id = $cookieStore.get('group');
	    		}
	    		var defered = $q.defer();
	    		$http.post(AUTHBEE_API + '/cs/fb/groups/' + id + '/feed', message).then(function (data) {
	    			defered.resolve(data.data);
	    		});

	    		return defered.promise;
	    	},
	    	isAnonymous: function () {
	            var defered = $q.defer();
	            if (!$cookieStore.get('token')) {
	                defered.resolve('Anonumous');
	            } else {
	                defered.reject('Authenticated');
	            }
	            return defered.promise;
	        },
	    	isAuthenticated: function () {
	    		var defered = $q.defer();
		        if ($cookieStore.get('token')) {
		        	$http.defaults.headers.common['Authorization'] = $cookieStore.get('appId') + ' ' + $cookieStore.get('token'); //jshint ignore:line
		        	if (!$rootScope.user) {
		        		this.getUser().then(function (user) {
		        			$rootScope.user = user;
		        			defered.resolve('Authenticated');
		        		});
		        	} else {
		        		defered.resolve('Authenticated');
		        	}
		        } else {
		          	defered.reject('Not Authenticated');
		        }

		        return defered.promise;
  			}
		};
	}

	authbee.$inject = ['$q', '$http', '$interval', '$cookieStore', '$rootScope'];

})(window, window.angular);
