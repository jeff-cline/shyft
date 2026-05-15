<?php get_header(); ?>

<article class="single-post">
<?php while ( have_posts() ) : the_post(); ?>
  <div class="post-meta"><?php echo esc_html( get_the_date( 'M d, Y' ) ); ?></div>
  <h1><?php the_title(); ?></h1>
  <div class="content"><?php the_content(); ?></div>
<?php endwhile; ?>
</article>

<?php get_footer(); ?>
