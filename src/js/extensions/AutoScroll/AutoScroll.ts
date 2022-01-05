import {
  BaseComponent,
  Components,
  EVENT_DRAG,
  EVENT_MOVE,
  EVENT_MOVED,
  EVENT_SCROLL,
  EVENT_SCROLLED,
  EVENT_UPDATED,
  EventInterface,
  Options,
  RequestInterval,
  RequestIntervalInterface,
  Splide,
} from '@splidejs/splide';
import { SLIDE } from '@splidejs/splide/src/js/constants/types';
import { assign, clamp, isObject, isUndefined } from '@splidejs/splide/src/js/utils';
import { DEFAULTS } from '../../constants/defaults';
import { AutoScrollOptions } from '../../types/options';


/**
 * Lets the compiler know this component.
 */
declare module '@splidejs/splide' {
  interface Options {
    autoScroll?: AutoScrollOptions | boolean;
  }

  interface Components {
    AutoScroll?: AutoScrollComponent;
  }
}

/**
 * The interface for the AutoScroll component.
 *
 * @since 0.1.0
 */
export interface AutoScrollComponent extends BaseComponent {
  play(): void;
  pause(): void;
}

/**
 * The extension for continuously scrolling the slider.
 *
 * @since 0.1.0
 *
 * @param Splide     - A Splide instance.
 * @param Components - A collection of components.
 * @param options    - Options.
 *
 * @return An AutoScroll component object.
 */
export function AutoScroll( Splide: Splide, Components: Components, options: Options ): AutoScrollComponent {
  const { on, off, bind, unbind } = EventInterface( Splide );
  const { translate, getPosition, toIndex, getLimit } = Components.Move;
  const { setIndex, getIndex } = Components.Controller;
  const { orient } = Components.Direction;
  const { root } = Splide;

  /**
   * Keeps the latest options.
   */
  let autoScrollOptions: AutoScrollOptions = {};

  /**
   * The RequestInterval object.
   */
  let interval: RequestIntervalInterface;

  /**
   * Turns into `true` when the auto scroll is manually paused.
   */
  let paused: boolean;

  /**
   * Indicates whether the mouse cursor is on the slider or not.
   */
  let hovered: boolean;

  /**
   * Indicates whether the slider contains active element or not.
   */
  let focused: boolean;

  /**
   * Indicates whether the slider is currently busy or not.
   */
  let busy: boolean;

  /**
   * Keeps the current position to restore.
   */
  let currPosition: number;

  /**
   * Sets up the component.
   */
  function setup(): void {
    const { autoScroll } = options;
    autoScrollOptions = assign( {}, DEFAULTS, isObject( autoScroll ) ? autoScroll : {} );
  }

  /**
   * Called when the component is mounted.
   */
  function mount(): void {
    if ( ! interval && options.autoScroll !== false ) {
      interval = RequestInterval( 0, move );
      listen();
      autoStart();
    }
  }

  /**
   * Destroys the component.
   */
  function destroy(): void {
    if ( interval ) {
      interval.cancel();
      interval = null;

      currPosition = undefined;

      off( [ EVENT_MOVE, EVENT_DRAG, EVENT_SCROLL, EVENT_MOVED, EVENT_SCROLLED ] );
      unbind( root, 'mouseenter mouseleave focusin focusout' );
    }
  }

  /**
   * Listens to some events.
   */
  function listen(): void {
    if ( autoScrollOptions.pauseOnHover ) {
      bind( root, 'mouseenter mouseleave', e => {
        hovered = e.type === 'mouseenter';
        autoToggle();
      } );
    }

    if ( autoScrollOptions.pauseOnFocus ) {
      bind( root, 'focusin focusout', e => {
        focused = e.type === 'focusin';
        autoToggle();
      } );
    }

    on( EVENT_UPDATED, update );

    on( [ EVENT_MOVE, EVENT_DRAG, EVENT_SCROLL ], () => {
      busy = true;
      pause( false );
    } );

    on( [ EVENT_MOVED, EVENT_SCROLLED ], () => {
      busy = false;
      autoToggle();
    } );
  }

  /**
   * Called when the slider is updated.
   * Attempts to keep continuous scrolling with the current position
   * since the update event makes the slider jump to the current index.
   */
  function update(): void {
    const { autoScroll } = options;

    if ( autoScroll !== false ) {
      autoScrollOptions = assign( autoScrollOptions, isObject( autoScroll ) ? autoScroll : {} );
      mount();
    } else {
      destroy();
    }

    if ( interval && ! isUndefined( currPosition ) ) {
      translate( currPosition );
    }
  }

  /**
   * Starts scrolling the slider on the proper timing.
   */
  function autoStart(): void {
    if ( autoScrollOptions.autoStart ) {
      if ( document.readyState === 'complete' ) {
        play();
      } else {
        bind( window, 'load', play );
      }
    }
  }

  /**
   * Starts auto scroll.
   */
  function play(): void {
    if ( interval && interval.isPaused() ) {
      interval.start( true );
    }
  }

  /**
   * Pauses auto scroll.
   *
   * @param manual - Optional. If `true`, auto scroll will never restart without calling `play()`.
   */
  function pause( manual = true ): void {
    if ( interval && ! interval.isPaused() ) {
      interval.pause();
    }

    paused = manual;
  }

  /**
   * Automatically plays or pauses scrolling.
   */
  function autoToggle(): void {
    if ( ! paused ) {
      if ( ! hovered && ! focused && ! busy ) {
        play();
      } else {
        pause( false );
      }
    }
  }

  /**
   * Called on every animation frame while the auto scroll is active.
   */
  function move(): void {
    const position    = getPosition();
    const destination = computeDestination( position );

    if ( position !== destination ) {
      translate( destination );
      updateIndex( destination );
      currPosition = destination;
    } else {
      pause( false );

      if ( autoScrollOptions.rewind ) {
        Splide.go( 0 );
      }
    }
  }

  /**
   * Returns the position to to.
   *
   * @param position - The current position.
   *
   * @return A computed destination.
   */
  function computeDestination( position: number ): number {
    const speed = autoScrollOptions.speed || 1;
    position += orient( speed );

    if ( Splide.is( SLIDE ) ) {
      position = clamp( position, getLimit( false ), getLimit( true ) );
    }

    return position;
  }

  /**
   * Updates index.
   *
   * @param position - A current position.
   */
  function updateIndex( position: number ): void {
    const { length } = Splide;
    const index = ( toIndex( position ) + length ) % length;

    if ( index !== getIndex() ) {
      setIndex( index );
      Components.Slides.update();
      Components.Pagination.update();
    }
  }

  return {
    setup,
    mount,
    destroy,
    play,
    pause,
  };
}
