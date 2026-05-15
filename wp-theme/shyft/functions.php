<?php
/**
 * shYft WordPress theme — functions.
 *
 * Pulls the logo URL and brand-Y color from the Next.js admin Settings via the
 * /api/brand endpoint so the WordPress blog stays visually in sync with the
 * main sites when Krystalore updates them. Defaults are safe if the API is
 * unreachable. The bold orange Y rule is opt-in inside posts via the
 * [shyft]...[/shyft] shortcode (so it never mangles user-supplied content
 * accidentally).
 */

if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! defined( 'SHYFT_BRAND_API' ) ) {
    define( 'SHYFT_BRAND_API', 'https://shyftmastery.com/api/brand' );
}

function shyft_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'automatic-feed-links' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'gallery', 'caption' ) );
    register_nav_menu( 'primary', __( 'Primary Navigation', 'shyft' ) );
}
add_action( 'after_setup_theme', 'shyft_setup' );

function shyft_enqueue_styles() {
    wp_enqueue_style(
        'shyft-theme',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get( 'Version' )
    );
}
add_action( 'wp_enqueue_scripts', 'shyft_enqueue_styles' );

/**
 * Fetch logo + brand color from the Next.js /api/brand endpoint.
 * Cached for 5 minutes via transients to avoid hitting the API every page load.
 */
function shyft_get_brand_config() {
    $cached = get_transient( 'shyft_brand_config' );
    if ( $cached !== false ) return $cached;

    $defaults = array( 'logo_url' => '', 'brand_y_hex' => '#D2691E' );
    $response = wp_remote_get( SHYFT_BRAND_API, array( 'timeout' => 5 ) );
    if ( is_wp_error( $response ) ) {
        set_transient( 'shyft_brand_config', $defaults, 60 ); // brief cache so we retry soon
        return $defaults;
    }
    $body = wp_remote_retrieve_body( $response );
    $data = json_decode( $body, true );
    if ( ! is_array( $data ) ) $data = $defaults;
    $data = array_merge( $defaults, $data );
    set_transient( 'shyft_brand_config', $data, 5 * MINUTE_IN_SECONDS );
    return $data;
}

/**
 * Wrap every Y/y in the given string with the brand-Y span. Used by the [shyft] shortcode.
 */
function shyft_apply_y_rule( $text ) {
    return preg_replace_callback(
        '/[yY]/u',
        function () { return '<span class="brand-y">Y</span>'; },
        $text
    );
}

function shyft_shortcode( $atts, $content = '' ) {
    return shyft_apply_y_rule( wp_kses_post( do_shortcode( $content ) ) );
}
add_shortcode( 'shyft', 'shyft_shortcode' );

/**
 * Inject the brand-Y color into <head> as a CSS variable override, so a color
 * change in admin Settings flows here within 5 minutes.
 */
function shyft_inject_brand_vars() {
    $brand = shyft_get_brand_config();
    $color = ! empty( $brand['brand_y_hex'] ) ? $brand['brand_y_hex'] : '#D2691E';
    echo '<style id="shyft-brand-vars">:root { --brand-y: ' . esc_attr( $color ) . "; }</style>\n";
}
add_action( 'wp_head', 'shyft_inject_brand_vars' );

/**
 * Allow clearing the brand transient by hitting /?clear_brand_cache=1 as admin.
 */
function shyft_maybe_clear_brand_cache() {
    if ( ! isset( $_GET['clear_brand_cache'] ) ) return;
    if ( ! current_user_can( 'manage_options' ) ) return;
    delete_transient( 'shyft_brand_config' );
    wp_die( 'Brand cache cleared.' );
}
add_action( 'init', 'shyft_maybe_clear_brand_cache' );
