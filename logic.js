function calculateUtilization({ skus, truckType, customVolume, customWeight }) {
  const truckCapacity = {
    small: { volume: 15, weight: 3000 },
    medium: { volume: 30, weight: 7000 },
    large: { volume: 45, weight: 12000 },
  };

  if (!Array.isArray(skus) || skus.length === 0) {
    throw new Error("SKUs must be a non-empty array.");
  }

  let truck;
  if (truckType === 'custom') {
    if (isNaN(customVolume) || isNaN(customWeight)) {
      throw new Error("Custom truck dimensions must be numbers.");
    }
    truck = { volume: customVolume, weight: customWeight };
  } else {
    truck = truckCapacity[truckType.toLowerCase()];
  }

  if (!truck || !truck.volume || !truck.weight) {
    throw new Error("Invalid truck type or missing truck capacity.");
  }

  const groups = {};
  for (const sku of skus) {
    const dest = sku.destination && typeof sku.destination === 'string' && sku.destination.trim() !== ''
      ? sku.destination.trim()
      : 'Unknown';

    if (!groups[dest]) {
      groups[dest] = [];
    }
    groups[dest].push(sku);
  }

  const results = [];

  for (const destination of Object.keys(groups).sort()) {
    const group = groups[destination];
    const totalVolume = group.reduce((sum, sku) => sum + sku.volume * sku.qty, 0);
    const totalWeight = group.reduce((sum, sku) => sum + sku.weight * sku.qty, 0);

    const trucksByVolume = Math.ceil(totalVolume / truck.volume);
    const trucksByWeight = Math.ceil(totalWeight / truck.weight);
    const trucksRequired = Math.max(trucksByVolume, trucksByWeight);

    const volumeUtil = (totalVolume / (trucksRequired * truck.volume)) * 100;
    const weightUtil = (totalWeight / (trucksRequired * truck.weight)) * 100;

    results.push({
      destination,
      trucksRequired,
      volumeUtil: volumeUtil.toFixed(1),
      weightUtil: weightUtil.toFixed(1),
      underUtilized: volumeUtil < 70 || weightUtil < 70
    });
  }

  return results;
}

// ✅ Required to use in server.js
module.exports = { calculateUtilization };