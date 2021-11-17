// import { HASH_ATTRIBUTE_NAME } from '../../extensions/URLHash/constants';
//
//
// export function buildHtml( length: number ): string {
// 	return `
// 	<div id="splide" class="splide">
// 	  <div class="splide__track">
// 	    <ul class="splide__list">
// 	      ${ generateSlides( length ) }
// 	    </ul>
// 	  </div>
// 	</div>
// 	`;
// }
//
// export function generateSlides( length: number ): string {
// 	return Array.from<string>( { length } ).reduce( ( html, item, index ) => {
// 		html += `<li class="splide__slide" ${ HASH_ATTRIBUTE_NAME }="${ index }">${ index }</li>`;
// 		return html;
// 	}, '' );
// }
