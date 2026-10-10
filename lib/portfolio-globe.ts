const RAD = Math.PI / 180;
const GOLDEN = 180 * (3 - Math.sqrt(5));

/** Size and space the globe for its actual collection, rather than assuming 32 highlights. */
export function portfolioGlobe(priorityCount: number, otherCount: number) {
  // 99 highlights get four staggered rows instead of crowding the old two-row band.
  const rows = Math.max(1, Math.ceil(Math.sqrt(priorityCount / 8)));
  const bandEdge = priorityCount > 32 ? 36 : 24;
  const rowStep = (2 * bandEdge) / rows;
  const rowCounts = Array.from({ length: rows }, (_, row) => Math.max(0, Math.ceil((priorityCount - row) / rows)));
  const rowLat = (row: number) => -bandEdge + (row + 0.5) * rowStep;
  const spacing = rowCounts.filter(Boolean).map((count, row) => 2 * Math.cos(rowLat(row) * RAD) * Math.sin(Math.PI / Math.max(2, count)));
  const priorityTileScale = Math.min(0.34, ...spacing.map((space) => space * 0.85), 2 * Math.sin(rowStep * RAD / 2) * 0.85);
  // Leave a gutter between the highlighted rows and the Fibonacci-distributed caps.
  const cap = priorityCount ? Math.sin((bandEdge + 3) * RAD) : 0;
  const otherTileScale = Math.min(0.25, priorityTileScale * 0.78, Math.sqrt((4 * Math.PI * (1 - cap)) / Math.max(1, otherCount)) * 0.75);
  const positions = Array.from({ length: priorityCount + otherCount }, (_, i) => {
    if (i < priorityCount) {
      const row = i % rows, k = Math.floor(i / rows), count = rowCounts[row];
      return { lon: ((k + (row % 2) / 2) * 360) / count, lat: rowLat(row) };
    }
    const k = i - priorityCount, z = 1 - (2 * (k + 0.5)) / otherCount;
    return { lon: (k * GOLDEN) % 360, lat: Math.asin((z < 0 ? -1 : 1) * (cap + (1 - cap) * Math.abs(z))) / RAD };
  });
  return { positions, priorityTileScale, otherTileScale };
}
