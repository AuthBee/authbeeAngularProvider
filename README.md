## Installation

Add a `<script>` to your `index.html`:

```html
<script src="/node_modules/angular/angular.js"></script>
```

Add authbee to your angular app
```javascript
.module('authbeeSeedApp', ['ngAuthbee'])
```

## Configuration

In your app.js file use 
```javascript
.config(function (authbeeProvider) {
	authbeeProvider.init({
		appId: 'oteqj65lj7df0c6',
		apiAddress: 'http://api.authbee.com'
	});
})
```
## Usage

Each authbee method is a promise
```javascript
authbee.login().then(function (data) { });
```
