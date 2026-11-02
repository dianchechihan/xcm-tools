import { deepEqual, type TLocation } from '@paraspell/sdk-common'

import { compareLocations } from '../../location'
import type { TAssetInfo } from '../../types'
import { canonicalizeLocation } from '../normalizeLocation'

export const findAssetInfoByLoc = (
  foreignAssets: TAssetInfo[],
  location: string | TLocation
): TAssetInfo | undefined => {
  const matches =
    typeof location === 'string'
      ? foreignAssets.filter(asset => compareLocations(location, asset))
      : foreignAssets.filter(
          asset =>
            asset.location &&
            deepEqual(canonicalizeLocation(location), canonicalizeLocation(asset.location))
        )

  if (matches.length > 1) {
    throw new Error(`Duplicate asset location: ${JSON.stringify(location)}`)
  }

  return matches[0]
}
