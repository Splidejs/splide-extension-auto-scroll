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
     * Determines if speed is set in real screen pixels or virtual viewport pixels.
     */
    virtualSpeed?: boolean;
    /**
     * The virtual viewport size that will scale to the real slider size to keep speed relative to the slider.
     * With the virtualSpeed = true and the same virtualViewportSize - two different sliders will scroll the same
     * number of slides on the same time
     */
    virtualViewportSize?: number;
    /**
     * The FPS upon which scroll speed is calculated.
     */
    fpsLock?: number;
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
//# sourceMappingURL=../../../src/js/types/options.d.ts.map