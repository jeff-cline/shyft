<?php get_header(); ?>

<section class="blog-hero">
  <div class="eyebrow">Search Results</div>
  <h1>"<?php echo esc_html( get_search_query() ); ?>"</h1>
</section>

<div class="post-grid">
<?php if ( have_posts() ) : ?>
  <?php while ( have_posts() ) : the_post(); ?>
    <a class="post-card" href="<?php the_permalink(); ?>">
      <div class="post-card-date"><?php echo esc_html( get_the_date( 'M d, Y' ) ); ?></div>
      <h2><?php the_title(); ?></h2>
      <div class="post-card-excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 28, '…' ) ); ?></div>
      <span class="post-card-cta">Read &rarr;</span>
    </a>
  <?php endwhile; ?>
<?php else : ?>
  <p style="grid-column: 1 / -1; text-align: center; opacity: 0.6;">No matches. Try a different word.</p>
<?php endif; ?>
</div>

<?php get_footer(); ?>
