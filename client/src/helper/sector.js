// Sector display id: sectors are numbered sequentially in row-major order
// (left-to-right, top-to-bottom), starting at 1.
// e.g. for a raft with 7 columns: row 0 -> 1..7, row 1 -> 8..14, ...
export const getSectorId = (row, col, cols) => row * cols + col + 1;
