export let pendingState = {};

export function setPending(userId, type) {
  pendingState[userId] = type;
}

export function getPending(userId) {
  return pendingState[userId];
}

export function clearPending(userId) {
  delete pendingState[userId];
}
