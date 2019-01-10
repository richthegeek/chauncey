const Redbeard = require('./');
const assert = require('assert');
const _ = require('lodash');

it('should export a function which returns an expected object', () => {
  const settings = Redbeard({})
  assert(_.isFunction(settings.get));
  assert(_.isFunction(settings.set));
  assert(_.isFunction(settings.setEnv));
  assert(_.isFunction(settings.useEnv));
})

describe('getting and setting', () => {

  it('should support method usage', () => {
    const settings = Redbeard();
    settings.set('foo', 'bar');
    assert.equal(settings.get('foo'), 'bar');
  })

  it('should support Proxy usage', () => {
    const settings = Redbeard();
    settings.foo = 'bar';
    assert.equal(settings.foo, 'bar')
  })

  it('should support setting a nested value', () => {
    const settings = Redbeard();
    settings.set('person.name', 'bob')
    assert.equal(settings.person.name, 'bob')
  })

  it('should support deburring an env-based leaf value from get()', () => {
    const settings = Redbeard();
    settings.setEnv('production');
    settings.foo = {production: 'x', development: 'y'}
    assert.equal(settings.foo, 'x')
  })

  it('should support deburring an env-based node value from get()', () => {
    const settings = Redbeard();
    settings.setEnv('production');
    settings.foo = {production: {color: 'red'}, development: {color: 'blue'}}
    assert.equal(settings.foo.color, 'red')    
  })
  
})

describe('process.env importing', () => {

  it('should support basic settings', () => {
    process.env.FOO = 'bar';
    const settings = Redbeard();
    settings.useEnv();
    assert.equal(settings.foo, 'bar')
  })

  it('should support nested settings', () => {
    process.env.PERSON__NAME = 'bob';
    process.env.NODE_PORT = '1234'
    const settings = Redbeard();
    settings.useEnv();
    assert.equal(settings.node_port, '1234')
    assert.equal(settings.person.name, 'bob')
  })

  it('should support filtering keys', () => {
    process.env.YES = 'yes';
    process.env.NO = 'no';
    const settings = Redbeard();
    settings.useEnv({filter: /^Y/})
    assert.equal(settings.yes, 'yes')
    assert.equal(settings.no, undefined)
  })

  it('should support custom splitting', () => {
    process.env.PERSON_NAME = 'bob'
    const settings = Redbeard();
    settings.useEnv({split: /_/});
    assert.equal(settings.person.name, 'bob')
  })

})
