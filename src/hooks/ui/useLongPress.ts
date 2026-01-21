import { useCallback, useRef, useState } from 'react';

export function useLongPress(
  onLongPress: () => void,
  onClick: () => void,
  { shouldPreventDefault = true, delay = 500 } = {}
) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const target = useRef<EventTarget | null>(null);

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (shouldPreventDefault && event.target) {
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        onLongPress();
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: React.TouchEvent | React.MouseEvent, shouldTriggerClick = true) => {
      if (timeout.current) clearTimeout(timeout.current);
      
      if (shouldTriggerClick && !longPressTriggered) {
        onClick();
      }
      
      setLongPressTriggered(false);
      
      if (shouldPreventDefault && target.current) {
        target.current = null;
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  );

  return {
    onMouseDown: (e: any) => start(e),
    onTouchStart: (e: any) => start(e),
    onMouseUp: (e: any) => clear(e),
    onMouseLeave: (e: any) => clear(e, false),
    onTouchEnd: (e: any) => clear(e),
  };
}