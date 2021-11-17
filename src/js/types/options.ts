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
   * Determines whether to pause the auto scroll when the cursor is on the slider.
   */
  pauseOnHover?: boolean;

  /**
   * Determines whether to pause the auto scroll when the slider contains an active element.
   */
  pauseOnFocus?: boolean;
}