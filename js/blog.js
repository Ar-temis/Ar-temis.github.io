/**
 * Blog system — Telescope-style picker + Markdown post renderer.
 *
 * How to add a new blog post:
 *   1. Create a .md file in blog/posts/  (e.g. blog/posts/my-new-post.md)
 *   2. Add an entry to blog/posts.json with slug, title, date, readTime, description
 *   That's it — the listing page and post template handle the rest.
 *
 * URL scheme:  blog/post.html?slug=hello-world
 *   → fetches  blog/posts/hello-world.md
 */

// Configure marked for clean output
if (typeof marked !== 'undefined') {
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
}

/**
 * Renders a single blog post on post.html
 */
async function renderPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    document.getElementById('post-content').innerHTML =
      '<p style="color: var(--red);">E: No post specified. <a href="index.html" style="color: var(--blue);">:Telescope blog</a></p>';
    return;
  }

  try {
    // Fetch the post metadata from the manifest
    const metaResponse = await fetch('posts.json');
    const posts = await metaResponse.json();
    const postMeta = posts.find(p => p.slug === slug);

    // Populate header
    if (postMeta) {
      document.getElementById('post-title').textContent = postMeta.title;
      document.getElementById('post-meta').innerHTML =
        `${postMeta.date} &middot; ${postMeta.readTime}`;
      document.title = `${postMeta.title} - Temuulen Enkhtamir`;
    }

    // Update statusline filename
    const stFile = document.getElementById('st-file-name');
    if (stFile) stFile.textContent = `~/blog/${slug}.md`;

    // Fetch and render the Markdown
    const mdResponse = await fetch(`posts/${slug}.md`);

    if (!mdResponse.ok) {
      throw new Error('Post not found');
    }

    const markdown = await mdResponse.text();
    const html = marked.parse(markdown);

    document.getElementById('post-content').innerHTML = html;

    // If no metadata was found, use the first h1 from the markdown as title
    if (!postMeta) {
      const match = markdown.match(/^#\s+(.+)$/m);
      if (match) {
        document.getElementById('post-title').textContent = match[1];
        document.title = `${match[1]} - Temuulen Enkhtamir`;
      }
    }
  } catch (err) {
    document.getElementById('post-content').innerHTML =
      '<p style="color: var(--red);">E: Could not load post. <a href="index.html" style="color: var(--blue);">:Telescope blog</a></p>';
  }
}

/**
 * Renders the Telescope-style blog listing on blog/index.html
 */
async function renderBlogList() {
  const container = document.getElementById('blog-list');
  if (!container) return;

  let allPosts = [];

  try {
    const response = await fetch('posts.json');
    allPosts = await response.json();
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (err) {
    container.innerHTML = '<div class="telescope-result-item" style="color: var(--red);">E: Could not load posts</div>';
    return;
  }

  if (allPosts.length === 0) {
    container.innerHTML = '<div class="telescope-result-item" style="color: var(--fg-dark);">No posts yet</div>';
    return;
  }

  const preview = document.getElementById('telescope-preview');
  const counter = document.getElementById('telescope-count');
  let activeIndex = 0;

  function renderResults(posts) {
    if (posts.length === 0) {
      container.innerHTML = '<div class="telescope-result-item" style="color: var(--fg-dark); justify-content: center; padding: 2rem;">No matching posts</div>';
      if (preview) preview.innerHTML = '';
      if (counter) counter.textContent = '0 / 0';
      return;
    }

    container.innerHTML = posts.map((post, i) => `
      <a href="post.html?slug=${post.slug}"
         class="telescope-result-item ${i === activeIndex ? 'active' : ''}"
         data-index="${i}"
         data-slug="${post.slug}">
        <span class="telescope-result-icon">&#9643;</span>
        <span class="telescope-result-title">${post.title}</span>
        <span class="telescope-result-date">${post.date}</span>
      </a>
    `).join('');

    if (counter) counter.textContent = `${activeIndex + 1} / ${posts.length}`;

    // Show preview for active item
    showPreview(posts[activeIndex]);

    // Hover to select
    container.querySelectorAll('.telescope-result-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        const idx = parseInt(item.dataset.index);
        setActive(idx, posts);
      });
    });
  }

  function setActive(index, posts) {
    activeIndex = index;
    container.querySelectorAll('.telescope-result-item').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
    if (counter) counter.textContent = `${index + 1} / ${posts.length}`;
    showPreview(posts[index]);
  }

  function showPreview(post) {
    if (!preview || !post) return;
    preview.innerHTML = `
      <div class="telescope-preview-title">${post.title}</div>
      <div class="telescope-preview-meta">${post.date} &middot; ${post.readTime}</div>
      <div class="telescope-preview-desc">${post.description}</div>
    `;
  }

  // Initial render
  renderResults(allPosts);

  // Search filtering
  const searchInput = document.getElementById('telescope-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      activeIndex = 0;
      if (!query) {
        renderResults(allPosts);
        return;
      }
      const filtered = allPosts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
      renderResults(filtered);
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
      const items = container.querySelectorAll('.telescope-result-item');
      const currentPosts = searchInput.value.trim()
        ? allPosts.filter(p =>
            p.title.toLowerCase().includes(searchInput.value.toLowerCase().trim()) ||
            p.description.toLowerCase().includes(searchInput.value.toLowerCase().trim())
          )
        : allPosts;

      if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'j')) {
        e.preventDefault();
        if (activeIndex < currentPosts.length - 1) {
          setActive(activeIndex + 1, currentPosts);
          items[activeIndex]?.scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        if (activeIndex > 0) {
          setActive(activeIndex - 1, currentPosts);
          items[activeIndex]?.scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeItem = container.querySelector('.telescope-result-item.active');
        if (activeItem) window.location.href = activeItem.href;
      }
    });

    // Auto-focus search
    searchInput.focus();
  }
}

// Determine which page we're on and run the appropriate function
if (document.getElementById('post-content')) {
  renderPost();
} else if (document.getElementById('blog-list')) {
  renderBlogList();
}
