<?php get_header(); ?>

<section class="blog-hero">
  <div class="eyebrow">shYft Mastery &mdash; Blog</div>
  <h1>The sh<span class="brand-y">Y</span>ft Blog</h1>
  <p>Field notes from the program. Tools, frameworks, and the occasional truth bomb.</p>
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
  <p style="grid-column: 1 / -1; text-align: center; opacity: 0.6;">
    No posts yet. Add your first one in <a href="<?php echo esc_url( admin_url( 'post-new.php' ) ); ?>">WordPress admin</a>.
  </p>
<?php endif; ?>
</div>

<?php if ( function_exists( 'the_posts_pagination' ) ) : ?>
<div class="pagination">
<?php the_posts_pagination( array(
  'prev_text' => '&larr; Older',
  'next_text' => 'Newer &rarr;',
) ); ?>
</div>
<?php endif; ?>

<?php get_footer(); ?>
