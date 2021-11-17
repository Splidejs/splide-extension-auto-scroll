import { Options, Splide } from '@splidejs/splide';
import { AutoScroll } from '../../extensions';


export function buildHtml( length: number ): string {
  return `
	<div id="splide" class="splide">
	  <div class="splide__track">
	    <ul class="splide__list">
	      ${ generateSlides( length ) }
	    </ul>
	  </div>
	</div>
	`;
}

export function generateSlides( length: number ): string {
  return Array.from<string>( { length } ).reduce( ( html, item, index ) => {
    html += `<li class="splide__slide">${ index }</li>`;
    return html;
  }, '' );
}

export function init( options?: Options ): Splide {
  document.body.innerHTML = buildHtml( 10 );
  const splide = new Splide( '#splide', options );
  splide.mount( { AutoScroll } );
  return splide;
}

export function wait( duration: number ): Promise<void> {
  return new Promise( resolve => {
    setTimeout( resolve, duration );
  } );
}