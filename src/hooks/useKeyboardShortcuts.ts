import { useEffect } from 'react';

export const useKeyboardShortcuts = (handlers: {
    onPlayPause?: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    onVolumeUp?: () => void;
    onVolumeDown?: () => void;
    onMute?: () => void;
    onSeekForward?: () => void;
    onSeekBackward?: () => void;
    onToggleShuffle?: () => void;
    onToggleRepeat?: () => void;
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    handlers.onPlayPause?.();
                    break;

                case 'arrowright':
                    if (e.shiftKey) {
                        handlers.onNext?.();
                    } else {
                        handlers.onSeekForward?.();
                    }
                    break;

                case 'arrowleft':
                    if (e.shiftKey) {
                        handlers.onPrevious?.();
                    } else {
                        handlers.onSeekBackward?.();
                    }
                    break;

                case 'arrowup':
                    e.preventDefault();
                    handlers.onVolumeUp?.();
                    break;

                case 'arrowdown':
                    e.preventDefault();
                    handlers.onVolumeDown?.();
                    break;

                case 'm':
                    handlers.onMute?.();
                    break;

                case 's':
                    handlers.onToggleShuffle?.();
                    break;

                case 'r':
                    handlers.onToggleRepeat?.();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlers]);
};
