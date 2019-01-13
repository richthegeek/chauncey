# Kojak

_(Named after an Irish Setter in a Stephen King novel, because all the better names are taken)_

A simple configuration container class, designed for handling settings objects easily. Design considerations:
* support environment-based property choices at any depth
* provide a native interface for getting and setting (no special methods *required*)
* support modification after creation
* support environment-changes after creation

It's a known limitation that convoluted series of setting a mix of keys and objects may result in unintuitive results - things set directly take precedence over objects set afterwards due to internal design. For sanity, either always set things using objects, or only use objects during the constructor phase and thereafter set directly on keys (e.g. `settings.foo = 'bar'` instead of `settings.set({foo: 'bar'}` where possible)

## API
### new Kojak([one, [two, [...])
Creates a new settings object with optional properties provided during creation

### .set(value, override = true)
Adds an object to the Kojak collection, making top-level keys from the value available as top-level keys on the Kojak object. `override` defines if the new data should take preccedence over existing data.

### .set(path, value, override = true)
Adds the defined path to the Kojak collection. A path is either a simple key name or a dot-separated path. It uses Lodash _.set internally.

### .get(path, default)
Returns the value at the provided path, or the default if it is undefined. It uses Lodash _.get internally.

### .setEnv(name)
Changes the chosen environment for path-resolution.

### .useEnv(options)
Imports properties from `process.env` according to provided options.
```javascript
settings.useEnv({
    prefix: '', // prefix string
    requirePrefix: false, // only add keys which match the prefix
    stripPrefix: false, // remove the prefix from keys that start with it

    castNumbers: false, // should numeric values be cast as Numbers
    
    split: /__/, // regex for splitting keys into nested parameters
    filter: /.*/, // regex for filtering keys which are added
    override: true // whether to override, or only provide defaults,
})
```

## Examples
### Basic usage, with a nested environment branch
```javascript
// NODE_ENV=development
let settings = new Kojak({
  color: {
    production: 'blue',
    development: 'green'
  }
});
console.log(settings.color) // 'green'
```
### A top-level environment branch
```javascript
// NODE_ENV=production
let settings = new Kojak({
    production: {
        color: 'blue'
    },
    development: {
        color: 'green'
    }
});
console.log(settings.color) // 'blue'
```

### Importing parameters from envvars
```javascript
// NODE_PORT=9182, NESTED__VALUE=hello
let settings = new Kojak();
settings.useEnv();
console.log(settings.node_port); // '9182'
console.log(settings.nested.value); // 'hello'
```

### Importing some parameters from envvars
```javascript
// NODE_PORT=9182, NESTED__VALUE=hello
let settings = new Kojak();
settings.useEnv({
    prefix: 'NODE_',
    requirePrefix: true,
    stripPrefix: true,
    castNumbers: true
});
console.log(settings.port); // 9182
```


### Getting a nested value with a default
```javascript
let settings = new Kojak();
settings.set({flagColor: {top: 'white', bottom: 'red'}})
console.log(settings.flagColor.top) // 'white'
console.log(settings.get('flagColor.left', 'blank')) // 'blank'
```

### Setting default-values after other things
```javascript
let settings = new Kojak({color: 'white'})

settings.set({color: 'blue', size: 'large'}, false); // false signifies it's a default
console.log(settings.color) // 'white'
console.log(settings.size) // 'large'
```

### Setting default values during construction
```javascript
let defaults = {color: 'white', size: 'large'};
let settings = new Kojak(defaults, {color: 'blue'}); // right-most values take precedence

console.log(settings.color) // 'blue'
console.log(settings.size) // 'large'
```