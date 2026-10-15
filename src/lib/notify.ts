export type NotifyLevel = 'error' | 'success';

export interface NotifyMessage {
  id: number;
  level: NotifyLevel;
  text: string;
}

type Listener = (message: NotifyMessage) => void;

const listeners = new Set<Listener>();
let nextId = 1;

function emit(level: NotifyLevel, text: string) {
  const message: NotifyMessage = { id: nextId++, level, text };
  for (const listener of listeners) listener(message);
}

export const notify = {
  error(msg: string) {
    emit('error', msg);
  },
  success(msg: string) {
    emit('success', msg);
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
