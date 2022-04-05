/**
 * The interface for options of the AutoScroll component.
 *
 * @since 0.1.0
 */
export interface AutoScrollOptions {
  /**
   * The scroll speed as pixel per frame.
   */
  speed?: number;

  /**
   * Determines whether to start scrolling the slider after initialization.
   */
  autoStart?: boolean;

  /**
   * Determines whether to rewind the slider when it reaches the end.
   */
  rewind?: boolean;

  /**
   * Determines whether to pause the auto scroll when the cursor is on the slider.
   */
  pauseOnHover?: boolean;

  /**
   * Determines whether to pause the auto scroll when the slider contains an active element.
   */
  pauseOnFocus?: boolean;

  /**
   * Determines whether to use the Autoplay toggle button for controlling auto scroll or not.
   */
  useToggleButton?: boolean;
}