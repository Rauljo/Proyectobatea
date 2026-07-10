// Sector display id: sectors are numbered sequentially in row-major order
// (left-to-right, top-to-bottom), starting at 1.
// e.g. for a raft with 7 columns: row 0 -> 1..7, row 1 -> 8..14, ...
export const getSectorId = (row, col, cols) => row * cols + col + 1;

// Inverse of getSectorId: a 1-based sequential id -> [row, col].
export const getRowCol = (id, cols) => {
  const idx = id - 1;
  return [Math.floor(idx / cols), idx % cols];
};
