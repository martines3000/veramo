import { DIDResolverPlugin } from '../resolver.js'
import { Resolver } from 'did-resolver'
import { describe, expect, it } from 'vitest'

describe('@veramo/did-resolver', () => {
  it('should throw error when misconfigured', () => {
    expect(() => {
      new DIDResolverPlugin({
        // @ts-ignore
        resolver: undefined,
      })
    }).toThrow()
  })

  it('should have resolve method', () => {
    const resolver = new DIDResolverPlugin({ resolver: new Resolver() })
    expect(resolver).toHaveProperty('resolveDid')
  })
})
