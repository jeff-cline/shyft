<?php
/**
 * Site header.
 */
$shyft_brand = shyft_get_brand_config();
$shyft_logo  = isset( $shyft_brand['logo_url'] ) ? $shyft_brand['logo_url'] : '';
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="https://shyftmastery.com/favicon.svg" type="image/svg+xml">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<header class="site-header">
  <div class="site-header-inner">
    <a class="site-logo" href="https://shyftmastery.com" aria-label="shYft Mastery home">
      <?php if ( $shyft_logo ) : ?>
        <img src="<?php echo esc_url( $shyft_logo ); ?>" alt="shYft">
      <?php else : ?>
        <span class="site-logo-placeholder">LOGO</span>
      <?php endif; ?>
      <span class="site-logo-suffix">Blog</span>
    </a>
    <nav class="site-nav" aria-label="Primary">
      <a href="https://shyftmastery.com">Mastery</a>
      <a href="https://shyftdoctor.com">Doctor</a>
      <a href="https://shyftmastery.com/free-gifts">Free Gifts</a>
      <a href="https://shyftmastery.com/mastery/login">Member Login</a>
      <a class="cta" href="https://shyftdoctor.com/doctor/book">Free Call</a>
    </nav>
  </div>
</header>
