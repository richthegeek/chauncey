const Kojak = require('./');
const assert = require('assert');
const _ = require('lodash');

it('should export a function which returns an expected object', () => {
  const settings = Kojak({})
  assert(_.isFunction(settings.get));
  assert(_.isFunction(settings.set));
  assert(_.isFunction(settings.setEnv));
  assert(_.isFunction(settings.useEnv));
})

describe('getting and setting', () => {

  it('should support method usage', () => {
    const settings = Kojak();
    settings.set('foo', 'bar');
    assert.equal(settings.get('foo'), 'bar');
  })

  it('should support Proxy usage', () => {
    const settings = Kojak();
    settings.foo = 'bar';
    assert.equal(settings.foo, 'bar')
  })

  it('should support setting a nested value', () => {
    const settings = Kojak();
    settings.set('person.name', 'bob')
    assert.equal(settings.person.name, 'bob')
  })

  it('should support deburring an env-based leaf value from get()', () => {
    const settings = Kojak();
    settings.setEnv('production');
    settings.foo = {production: 'x', development: 'y'}
    assert.equal(settings.foo, 'x')
  })

  it('should support deburring an env-based node value from get()', () => {
    const settings = Kojak();
    settings.setEnv('production');
    settings.foo = {production: {color: 'red'}, development: {color: 'blue'}}
    assert.equal(settings.foo.color, 'red')    
  })
  
})

describe('process.env importing', () => {

  it('should support basic settings', () => {
    process.env.FOO = 'bar';
    process.env.PORT = '1234';
    const settings = Kojak();
    settings.useEnv();
    assert.equal(settings.foo, 'bar')
    assert.equal(settings.port, '1234')
    assert.equal(typeof settings.port, 'string')
  })

  it('should support Number casting', () => {
    process.env.FOO = 'bar';
    process.env.PORT = '1234'
    const settings = Kojak();
    settings.useEnv({castNumbers: true});
    assert.equal(settings.foo, 'bar')
    assert.equal(settings.port, 1234)
    assert.equal(typeof settings.port, 'number')
  })

  it('should support nested settings', () => {
    process.env.PERSON__NAME = 'bob';
    process.env.NODE_PORT = '1234'
    const settings = Kojak();
    settings.useEnv();
    assert.equal(settings.node_port, '1234')
    assert.equal(settings.person.name, 'bob')
  })

  it('should support filtering keys', () => {
    process.env.YES = 'yes';
    process.env.NO = 'no';
    const settings = Kojak();
    settings.useEnv({filter: /^Y/})
    assert.equal(settings.yes, 'yes')
    assert.equal(settings.no, undefined)
  })

  it('should support custom splitting', () => {
    process.env.PERSON_NAME = 'bob'
    const settings = Kojak();
    settings.useEnv({split: /_/});
    assert.equal(settings.person.name, 'bob')
  })

  it('should support a (require=true,strip=false) prefix', () => {
    process.env.NODE_PORT = '1234';
    process.env.TEST = 'test'
    
    const settings = Kojak();
    settings.useEnv({
      prefix: 'node_',
      requirePrefix: true,
      stripPrefix: false
    });
    
    assert.equal(settings.node_port, '1234')
    assert.equal(settings.test, undefined)
  })

  it('should support a (require=false,strip=true) prefix', () => {
    process.env.NODE_PORT = '1234';
    process.env.TEST = 'test'
    
    const settings = Kojak();
    settings.useEnv({
      prefix: 'node_',
      requirePrefix: false,
      stripPrefix: true
    });
    
    assert.equal(settings.port, '1234')
    assert.equal(settings.test, 'test')
  })

  it('should support a (require=true,strip=true) prefix', () => {
    process.env.NODE_PORT = '1234';
    process.env.TEST = 'test'
    
    const settings = Kojak();
    settings.useEnv({
      prefix: 'node_',
      requirePrefix: true,
      stripPrefix: true
    });
    
    assert.equal(settings.port, '1234')
    assert.equal(settings.test, undefined)
  })  
})
