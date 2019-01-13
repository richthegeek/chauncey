const _ = require('lodash');
const traverse = require('traverse');

function Kojak (...args) {
  
  let Objects = args;
  let ObjectData = {};
  let Data = {};
  let env = process.env.NODE_ENV || 'development';
  let envObject = {};

  function useEnv (options) {
    _.defaults(options, {
      prefix: '',
      stripPrefix: false,
      requirePrefix: false,
      filter: /.*/,
      split: /__/,
      override: true,
      castNumbers: false
    })
    options.prefix = options.prefix.toLowerCase();
    options.filter = new RegExp(options.filter.source.toLowerCase(), options.filter.flags);
    options.split = new RegExp(options.split.source.toLowerCase(), 'gi')

    _.forEach(process.env, (value, key) => {
      key = key.toLowerCase();

      // prefix rules
      if (_.startsWith(key, options.prefix)) {
        if (options.stripPrefix) {
          key = key.slice(options.prefix.length)
        }
      } else if (options.requirePrefix) {
        return;
      }

      // filter rules
      if (!options.filter.test(key)) {
        return;
      }

      if (options.castNumbers && !isNaN(Number(value))) {
        value = Number(value);
      }

      _.set(envObject, key.split(options.split), value)
    })

    // always set to define the setters
    set(envObject, options.override);
    
    if (!options.override) {
      // clear the envObject so it doesnt override later
      envObject = {};
    }
  }

  function get (key, fallback) {
    return _.get(ObjectData, key, fallback);
  }

  function buildObjectData () {
    ObjectData = _.merge.apply(_, [envObject, Data].concat(Objects))

    traverse(ObjectData).forEach(function (x) {
      if (_.has(x, env)) {
        this.update(x[env])
      }
    })
  }

  function addGetter (name) {
    Object.defineProperty(self, name, {
      configurable: true,
      enumerable: true,
      get () {
        return get(name);
      }
    })    
  }

  function set (data, value, override = true) {
    if (_.isArray(data) || _.isString(data)) {
      let key = _.castArray(data).join('.');
      let keyBase = key.split('.')[0];

      if (override || get(keyBase) === undefined) {
        _.set(Data, key, value);
      }

    } else if (_.isObject(data)) {
      override = value;
      // store this in the stored objects for lookup with setter
      if (override !== false) {
        Objects.push(data);
      } else {
        Objects.unshift(data);
      }
    }

    buildObjectData();

    return this;
  }

  function toJSON () {
    return ObjectData
  }

  // call this now to build constructor arguments
  buildObjectData()

  let self = {
    get: (key, fallback) => { return get(key, fallback) },
    set: (data, value, override) => { return set(data, value, override) },
    setEnv: (_env) => { return env = _env },
    useEnv: (options = {}) => { return useEnv(options) },
    toJSON: toJSON
  }

  return new Proxy(self, {
    set (target, key, value) {
      return target.set(key, value)
    },
    get (target, key) {
      return self[key] ? self[key] : target.get(key)
    },
    has (target, key) {
      return self[key] ? true : target.get(key)
    },
    ownKeys (target) {
      return _.uniq(Object.keys(Data).concat(Object.keys(ObjectData)))
    }
  })
  return self;
}

module.exports = Kojak;
