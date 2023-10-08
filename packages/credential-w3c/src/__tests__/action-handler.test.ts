import { vi, describe, expect, it } from 'vitest'

// // Mock must come before imports with transitive dependency.
// jest.unstable_mockModule('did-jwt-vc', () => ({
//   createVerifiableCredentialJwt: vi.fn(() => Promise.resolve('mockVcJwt')),
//   createVerifiablePresentationJwt: vi.fn(() => Promise.resolve('mockVcJwt')),
//   verifyCredential: vi.fn(() => Promise.resolve({ payload: {} })),
//   normalizeCredential: vi.fn(() => Promise.resolve('mockCredential')),
//   normalizePresentation: vi.fn(() => Promise.resolve('mockPresentation')),
// }))

import {
  CredentialPayload,
  ICredentialPlugin,
  IDataStore,
  IDIDManager,
  IIdentifier,
  IKey,
  IKeyManager,
  IResolver,
  PresentationPayload,
  TAgent,
  VerifiableCredential,
} from '../../../core-types/src'
import { CredentialPlugin } from '../action-handler'

const mockIdentifiers: IIdentifier[] = [
  {
    did: 'did:example:111',
    provider: 'mock',
    controllerKeyId: 'kid1',
    keys: [
      {
        kid: 'kid1',
        publicKeyHex: 'pub',
        type: 'Secp256k1',
        kms: 'mock',
      },
    ],
    services: [],
  },
  {
    did: 'did:example:222',
    provider: 'mock',
    controllerKeyId: 'kid2',
    keys: [
      {
        kid: 'kid2',
        publicKeyHex: 'pub',
        type: 'Secp256k1',
        kms: 'mock',
      },
    ],
    services: [],
  },
  {
    did: 'did:example:333',
    provider: 'mock',
    controllerKeyId: 'kid3',
    keys: [
      {
        kid: 'kid3',
        publicKeyHex: 'pub',
        type: 'Ed25519',
        kms: 'mock',
      },
    ],
    services: [],
  },
]

const w3c = new CredentialPlugin()

let agent = {
  execute: vi.fn(),
  availableMethods: vi.fn(),
  resolveDid: vi.fn(),
  getDIDComponentById: vi.fn(),
  emit: vi.fn(),
  keyManagerSign: vi.fn(async (args): Promise<string> => 'mockJWT'),
  keyManagerGet: vi.fn(
    async (args): Promise<IKey> => ({
      kid: '',
      kms: '',
      type: 'Ed25519',
      publicKeyHex: '',
    }),
  ),
  dataStoreSaveVerifiableCredential: vi.fn(async (args): Promise<boolean> => true),
  dataStoreSaveVerifiablePresentation: vi.fn(async (args): Promise<boolean> => true),
  getSchema: vi.fn(),
  didManagerGet: vi.fn(),
  didManagerFind: vi.fn(),
  createVerifiableCredentialLD: vi.fn(),
  createVerifiablePresentationLD: vi.fn(),
  verifyCredentialLD: vi.fn(),
  verifyPresentationLD: vi.fn(),
} as any as TAgent<IResolver & IDIDManager & IKeyManager & ICredentialPlugin & IDataStore>

describe('@veramo/credential-w3c', () => {
  it.each(mockIdentifiers)('handles createVerifiableCredential', async (mockIdentifier) => {
    expect.assertions(3)

    agent.didManagerGet = vi.fn(async (args): Promise<IIdentifier> => mockIdentifier)
    const context = { agent }

    const credential: CredentialPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2020/demo/4342323'],
      type: ['VerifiableCredential', 'PublicProfile'],
      issuer: { id: mockIdentifier.did },
      issuanceDate: new Date().toISOString(),
      id: 'vc1',
      credentialSubject: {
        id: 'https://example.com/user/alice',
        name: 'Alice',
        profilePicture: 'https://example.com/a.png',
        address: {
          street: 'Some str.',
          house: 1,
        },
      },
    }

    const vc = await w3c.createVerifiableCredential(
      {
        credential,
        save: false,
        proofFormat: 'jwt',
      },
      context,
    )
    // TODO Update these after refactoring did-jwt-vc
    expect(context.agent.didManagerGet).toBeCalledWith({ did: mockIdentifier.did })
    expect(context.agent.dataStoreSaveVerifiableCredential).not.toBeCalled()
    expect(vc.id).toEqual('vc1')
  })

  it.each(mockIdentifiers)('handles createVerifiablePresentation', async (mockIdentifier) => {
    expect.assertions(3)

    agent.didManagerGet = vi.fn(async (args): Promise<IIdentifier> => mockIdentifier)
    const context = { agent }

    const credential = await w3c.createVerifiableCredential(
      {
        credential: {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', 'PublicProfile'],
          issuer: { id: mockIdentifier.did },
          issuanceDate: new Date().toISOString(),
          id: 'vc1',
          credentialSubject: {
            id: 'https://example.com/user/alice',
            name: 'Alice',
            profilePicture: 'https://example.com/a.png',
            address: {
              street: 'Some str.',
              house: 1,
            },
          },
        },
        save: false,
        proofFormat: 'jwt',
      },
      context,
    )

    const presentation: PresentationPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: mockIdentifier.did,
      issuanceDate: new Date().toISOString(),
      verifiableCredential: [credential],
    }

    const vp = await w3c.createVerifiablePresentation(
      {
        presentation,
        save: false,
        proofFormat: 'jwt',
      },
      context,
    )

    expect(context.agent.didManagerGet).toBeCalledWith({ did: mockIdentifier.did })
    expect(context.agent.dataStoreSaveVerifiablePresentation).not.toBeCalled()
    expect(vp.holder).toEqual(mockIdentifier.did)
  })
})
