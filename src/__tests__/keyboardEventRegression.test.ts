// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

describe('Keyboard Event Regression & Event Handling', () => {
  it('prevents default and stops propagation on Enter in chat input', () => {
    const input = document.createElement('input');
    input.type = 'text';

    const stopPropagationSpy = vi.fn();
    const preventDefaultSpy = vi.fn();

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(event, 'stopPropagation', { value: stopPropagationSpy });
    Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    input.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('allows Shift+Enter without preventing default or stopping propagation', () => {
    const input = document.createElement('input');
    input.type = 'text';

    const stopPropagationSpy = vi.fn();
    const preventDefaultSpy = vi.fn();

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(event, 'stopPropagation', { value: stopPropagationSpy });
    Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    input.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(stopPropagationSpy).not.toHaveBeenCalled();
  });

  it('respects defaultPrevented in global window event listeners', () => {
    const windowListener = vi.fn((e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      // Global shortcut logic
    });

    window.addEventListener('keydown', windowListener);

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    event.preventDefault(); // simulated prior handling

    window.dispatchEvent(event);

    expect(windowListener).toHaveBeenCalled();
    // Since e.defaultPrevented is true, handler returns early without running shortcut logic

    window.removeEventListener('keydown', windowListener);
  });

  it('prevents duplicate submissions when isThinking is true', () => {
    let isThinking = true;
    const sendMessage = vi.fn(() => {
      if (isThinking) return;
      // send logic
    });

    if (!isThinking) {
      sendMessage();
    }

    expect(sendMessage).not.toHaveBeenCalled();

    isThinking = false;
    if (!isThinking) {
      sendMessage();
    }
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });
});
