import {
  createClientCache,
  createClientPoolHelpers,
  EXTENSION_MS,
  MAX_CLIENTS
} from '@paraspell/sdk-core'
import type { PublicClient } from 'viem'
import { createPublicClient, fallback, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

export const ETHEREUM_WS_URLS: string[] = [
  'wss://ethereum-rpc.publicnode.com',
  'wss://eth.drpc.org',
  'wss://eth.llamarpc.com',
  'wss://ethereum.public.blockpi.network/v1/ws/public',
  'wss://eth-mainnet.public.blastapi.io'
]

const cache = createClientCache<PublicClient>(
  MAX_CLIENTS,
  async client => {
    await client.getBlockNumber()
  },
  async client => {
    const transport = client.transport as unknown as {
      value?: {
        transports?: Array<{
          value?: { getRpcClient?: () => { close?: () => void | Promise<void> } }
        }>
        getRpcClient?: () => { close?: () => void | Promise<void> }
      }
    }
    const transports = transport.value?.transports ?? [transport]

    for (const transport of transports) {
      try {
        await transport.value?.getRpcClient?.().close?.()
      } catch {
        // Continue closing the remaining transports if one fails.
      }
    }
  },
  EXTENSION_MS
)

export const { leaseClient, releaseClient } = createClientPoolHelpers<PublicClient>(cache, urls => {
  const list = Array.isArray(urls) ? urls : [urls]
  return createPublicClient({
    chain: mainnet,
    transport: fallback(list.map(url => webSocket(url)))
  })
})
