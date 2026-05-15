<?php get_header(); ?>

<article class="single-post">
<?php while ( have_posts() ) : the_post(); ?>
  <h1><?php the_title(); ?></h1>
  <div class="content"><?php the_content(); ?></div>
<?php endwhile; ?>
</article>

<?php get_footer(); ?>
