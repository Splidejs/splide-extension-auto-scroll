import {
  BaseComponent,
  Components,
  EVENT_DRAG,
  EVENT_DRAGGED,
  EVENT_MOVE,
  EVENT_MOVED,
  EVENT_SCROLL,
  EVENT_SCROLLED,
  EventInterface,
  Options,
  RequestInterval,
  Splide,
} from '@splidejs/splide';
import { SLIDE } from '@splidejs/splide/src/js/constants/types';
import { assign, clamp } from '@splidejs/splide/src/js/utils';
import { DEFAULTS } from '../../constants/defaults';
import { AutoScrollOptions } from '../../types/options';


/**
 * Lets the compiler know the type of auto scroll options.
 */
declare module '@splidejs/splide' {
  interface Options {
    autoScroll?: AutoScrollOptions;
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
	const { on, bind, emit } = EventInterface( Splide );
  const { translate, getPosition, toIndex, getLimit } = Components.Move;
  const { setIndex, getIndex } = Components.Controller;
  const { orient } = Components.Direction;
  const interval = RequestInterval( Infinity, null, update );
  const { isPaused } = interval;
  const autoScrollOptions = assign( {}, DEFAULTS, options.autoScroll || {} );

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
	 * Called when the component is mounted.
	 */
	function mount(): void {
    listen();
    play();
	}

  /**
   * Listens to some events.
   */
  function listen(): void {
    const { root } = Splide;

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

    on( [ EVENT_MOVE, EVENT_MOVED, EVENT_DRAG, EVENT_DRAGGED, EVENT_SCROLL, EVENT_SCROLLED ], autoToggle );
  }

  /**
   * Starts auto scroll.
   */
  function play(): void {
    if ( isPaused() ) {
      interval.start( true );
      emit( EVENT_SCROLL );
    }
  }

  /**
   * Pauses auto scroll.
   *
   * @param manual - Optional. If `true`, auto scroll will never restart without calling `play()`.
   */
  function pause( manual = true ): void {
    if ( ! isPaused() ) {
      interval.pause();
      emit( EVENT_SCROLLED );
    }

    paused = manual;
  }

  /**
   * Automatically plays or pauses scrolling.
   */
  function autoToggle(): void {
    if ( ! paused ) {
      if ( ! hovered && ! focused ) {
        play();
      } else {
        pause( false );
      }
    }
  }

  /**
   * Called on every animation frame while the auto scroll is active.
   */
  function update(): void {
    const position    = getPosition();
    const destination = computeDestination( position );

    if ( position !== destination ) {
      translate( destination );
      updateIndex( destination );
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
    const speed = options.autoScroll?.speed || 1;
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
      emit( EVENT_SCROLLED );
      emit( EVENT_SCROLL );
    }
  }

	return {
		mount,
    play,
    pause,
	}
}
