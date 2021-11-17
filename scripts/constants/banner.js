const info = require( '../../package.json' );

module.exports = `/*!
 * ${ info.name }
 * Version  : ${ info.version }
 * License  : ${ info.license }
 * Copyright: ${ new Date().getFullYear() } ${ info.author }
 */`;
