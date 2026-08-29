// Backward-compatibility re-export.
// The old ExpenseSheet has been replaced by the unified TransactionSheet.
// This file kept only to avoid missing-module errors in any code that may still import it.
export { TransactionSheet as ExpenseSheet } from "./transaction-sheet";
