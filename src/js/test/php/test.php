<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<title>Auto Scroll</title>

	<link rel="stylesheet" href="../../../../node_modules/@splidejs/splide/dist/css/themes/splide-default.min.css">
	<script type="text/javascript" src="../../../../node_modules/@splidejs/splide/dist/js/splide.js"></script>
	<script type="text/javascript" src="../../../../dist/js/splide-extension-auto-scroll.js"></script>

	<script>
		document.addEventListener( 'DOMContentLoaded', function () {
			var splide = new Splide( '#splide01', {
				width  : 600,
				height : 300,
				gap    : '1rem',
        drag   : 'free',
        autoScroll: {
          useToggleButton: true,
          // autoStart: false,
          speed: 2,
          rewind: true,
        },
        breakpoints: {
          1000: {
            autoScroll: {
              speed: 5,
            },
          },
          900: {
            autoScroll: false,
          }
        }
			} );

      // splide.Components.AutoScroll.play();

			splide.mount( window.splide.Extensions );

      // splide.on( 'scroll', () => console.log( 'scroll' ) );
      // splide.on( 'scrolled', () => console.log( 'scrolled' ) );
		} );
	</script>

	<style>
		.splide__slide {
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 4rem;
      background: #eee;
      border: 2px solid transparent;
		}

    .splide__slide.is-active {
      border: 2px solid skyblue;
    }
	</style>
</head>
<body>

<div id="splide01" class="splide">
	<div class="splide__track">
		<ul class="splide__list">
			<?php
			for ( $i = 0; $i < 10; $i ++ ) {
				echo '<li class="splide__slide">' . PHP_EOL;
				echo $i + 1;
				echo '</li>' . PHP_EOL;
			}
			echo '</ul>';
			?>
		</ul>
	</div>

  <button class="splide__toggle">
    <span class="splide__toggle__play">Play</span>
    <span class="splide__toggle__pause">Pause</span>
  </button>
</div>

</body>
</html>
