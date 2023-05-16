import { getAddress } from '@ethersproject/address';
import { subgraphRequest } from '../../utils';
import { Asset, Scores } from './types';

export const author = 'failfmi';
export const version = '0.1.0';

const SUBGRAPH_QUERY_IN_FILTER_MAX_LENGTH = 500;

export async function strategy(
  space,
  network,
  provider,
  addresses,
  options,
  snapshot
) {
  const scores: Scores = {};
  // Initialize scores for every provided address as 0
  for (const address of addresses) {
    scores[getAddress(address)] = 0;
  }

  const assetsOwners = await fetchAssetsOwners(addresses, options, snapshot);
  const assetsConsumers = await fetchStakedAssetsConsumers(
    addresses,
    options,
    snapshot
  );

  for (const asset of assetsOwners) {
    scores[getAddress(asset.owner.id)] +=
      asset.decentralandData.coordinates.length * options.multipliers.land;
  }

  for (const asset of assetsConsumers) {
    scores[getAddress(asset.consumer.id)] +=
      asset.decentralandData.coordinates.length * options.multipliers.land;
  }

  return scores;
}

// For a given list of addresses, fetch all the lands and estates that belong to them.
async function fetchAssetsOwners(
  addresses,
  options,
  snapshot
): Promise<Asset[]> {
  // Separate the addresses in batches to optimize the subgraph query.
  const addressBatches = batchify<string>(
    addresses,
    SUBGRAPH_QUERY_IN_FILTER_MAX_LENGTH
  );

  let assets: Asset[] = [];

  for (const addressBatch of addressBatches) {
    const query: any = {
      assets: {
        __args: {
          where: {
            metaverseRegistry_in: [
              options.addresses.estate.toLowerCase(),
              options.addresses.land.toLowerCase()
            ],
            owner_in: addressBatch.map((address) => address.toLowerCase()),
            status_not: 'WITHDRAWN'
          },
          first: 1000,
          skip: 0
        },
        id: true,
        metaverseRegistry: {
          id: true
        },
        metaverseAssetId: true,
        owner: {
          id: true
        },
        decentralandData: {
          id: true,
          coordinates: {
            id: true
          }
        }
      }
    };

    // If a snapshot is provided, use it as another filter of the query.
    if (typeof snapshot === 'number') {
      query.assets.__args.block = { number: snapshot };
    }

    let hasMoreResults = true;

    while (hasMoreResults) {
      const result = await subgraphRequest(options.subgraphs.landworks, query);

      const rentalLandsAndEstates: Asset[] = result.assets;

      // If the received length matches the requested length, there might be more results.
      hasMoreResults =
        rentalLandsAndEstates.length === query.assets.__args.first;
      // If there are more results, skip the ones we already have on the next query.
      query.assets.__args.skip += query.assets.__args.first;

      assets = [...assets, ...rentalLandsAndEstates];
    }
  }

  return assets;
}

// For a given list of addresses, fetch all the lands and estates that belong to `addresses` and have been staked.
// Owners that have staked their LW ERC-721 become consumers.
async function fetchStakedAssetsConsumers(addresses, options, snapshot) {
  // Separate the addresses in batches to optimize the subgraph query.
  const addressBatches = batchify<string>(
    addresses,
    SUBGRAPH_QUERY_IN_FILTER_MAX_LENGTH
  );

  let assets: Asset[] = [];

  for (const addressBatch of addressBatches) {
    const query: any = {
      assets: {
        __args: {
          where: {
            metaverseRegistry_in: [
              options.addresses.estate.toLowerCase(),
              options.addresses.land.toLowerCase()
            ],
            owner: options.addresses.stakingContract.toLowerCase(),
            consumer_in: addressBatch.map((address) => address.toLowerCase()),
            status_not: 'WITHDRAWN'
          },
          first: 1000,
          skip: 0
        },
        id: true,
        metaverseRegistry: {
          id: true
        },
        owner: {
          id: true
        },
        metaverseAssetId: true,
        consumer: {
          id: true
        },
        decentralandData: {
          id: true,
          coordinates: {
            id: true
          }
        }
      }
    };

    // If a snapshot is provided, use it as another filter of the query.
    if (typeof snapshot === 'number') {
      query.assets.__args.block = { number: snapshot };
    }

    let hasMoreResults = true;

    while (hasMoreResults) {
      const result = await subgraphRequest(options.subgraphs.landworks, query);

      const rentalLandsAndEstates: Asset[] = result.assets;

      // If the received length matches the requested length, there might be more results.
      hasMoreResults =
        rentalLandsAndEstates.length === query.assets.__args.first;
      // If there are more results, skip the ones we already have on the next query.
      query.assets.__args.skip += query.assets.__args.first;

      assets = [...assets, ...rentalLandsAndEstates];
    }
  }

  return assets;
}

function batchify<T>(elements: T[], batchSize: number): T[][] {
  const batches: T[][] = [];

  for (let i = 0; i < elements.length; i++) {
    if (i % batchSize === 0) {
      batches.push([]);
    }

    batches[batches.length - 1].push(elements[i]);
  }

  return batches;
}
