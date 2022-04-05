import { BaseComponent, Components, Options, Splide } from '@splidejs/splide';
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
    isPaused(): boolean;
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
export declare function AutoScroll(Splide: Splide, Components: Components, options: Options): AutoScrollComponent;
//# sourceMappingURL=../../../../src/js/extensions/AutoScroll/AutoScroll.d.ts.map