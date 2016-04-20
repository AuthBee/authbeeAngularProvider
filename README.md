## Installation

Add a `<script>` to your `index.html`:

```html
<script src="/node_modules/angular/angular.js"></script>
```

Add authbee to You angular app
```javascript
.module('authbeeSeedApp', ['ngAuthbee'])
```

## Configuration

In Your app.js file use 
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
