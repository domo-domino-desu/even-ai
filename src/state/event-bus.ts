import { atom, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

export type EventPayload = {
  [key: string]: any;
};

export type AppEvents = {
  "plugin:download": { content: string };
  [key: string]: any;
};

export type EventName = keyof AppEvents;
export type EventListener<T extends EventName> = (
  payload: AppEvents[T],
) => void;

const listenersMapAtom = atom<Map<EventName, Set<EventListener<any>>>>(
  new Map(),
);

const publishEventAtom = atom(
  null,
  (
    get,
    _set,
    { eventName, payload }: { eventName: EventName; payload?: any },
  ) => {
    const listeners = get(listenersMapAtom).get(eventName);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in event listener for '${eventName}':`, error);
        }
      });
    }
  },
);

const manageListenersAtom = atom(
  null,
  (
    get,
    set,
    action: {
      type: "add" | "remove";
      eventName: EventName;
      listener: EventListener<any>;
    },
  ) => {
    const currentMap = get(listenersMapAtom);
    const newMap = new Map(currentMap);

    let listeners = newMap.get(action.eventName);

    if (action.type === "add") {
      if (!listeners) {
        listeners = new Set();
        newMap.set(action.eventName, listeners);
      }
      listeners.add(action.listener);
    } else {
      if (listeners) {
        listeners.delete(action.listener);
        if (listeners.size === 0) {
          newMap.delete(action.eventName);
        }
      }
    }
    set(listenersMapAtom, newMap);
  },
);

export function usePublishEvent() {
  const publish = useSetAtom(publishEventAtom);

  return useCallback(
    <T extends EventName>(eventName: T, payload: AppEvents[T]) => {
      publish({ eventName, payload });
    },
    [publish],
  );
}

export function useListenToEvent<T extends EventName>(
  eventName: T,
  listener: EventListener<T>,
) {
  const manage = useSetAtom(manageListenersAtom);

  useEffect(() => {
    manage({
      type: "add",
      eventName,
      listener: listener as EventListener<any>,
    });

    return () => {
      manage({
        type: "remove",
        eventName,
        listener: listener as EventListener<any>,
      });
    };
  }, [eventName, listener, manage]);
}
