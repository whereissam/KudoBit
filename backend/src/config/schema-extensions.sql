-- KudoBit Database Schema Extensions
-- Adding missing features for Phase 1 & 2

-- ============================================
-- PHASE 1: SEARCH & DISCOVERY
-- ============================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product-Category relationship (many-to-many)
CREATE TABLE IF NOT EXISTS product_categories (
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product-Tag relationship (many-to-many)
CREATE TABLE IF NOT EXISTS product_tags (
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product views/downloads tracking
CREATE TABLE IF NOT EXISTS product_analytics (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,
  last_downloaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id)
);

-- Download tracking (for secure content delivery)
CREATE TABLE IF NOT EXISTS downloads (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER REFERENCES purchases(id) ON DELETE CASCADE,
  buyer_address VARCHAR(42) NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  download_url TEXT,
  expires_at TIMESTAMP NOT NULL,
  downloaded_at TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PHASE 2: SOCIAL FEATURES
-- ============================================

-- Reviews & Ratings
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  buyer_address VARCHAR(42) NOT NULL,
  purchase_id INTEGER REFERENCES purchases(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, buyer_address) -- One review per buyer per product
);

-- Review helpfulness tracking
CREATE TABLE IF NOT EXISTS review_helpful (
  review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
  voter_address VARCHAR(42) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id, voter_address)
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlists (
  id SERIAL PRIMARY KEY,
  user_address VARCHAR(42) NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_address, product_id)
);

-- Follow creators
CREATE TABLE IF NOT EXISTS follows (
  id SERIAL PRIMARY KEY,
  follower_address VARCHAR(42) NOT NULL,
  creator_address VARCHAR(42) REFERENCES creators(address) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_address, creator_address)
);

-- ============================================
-- CREATOR ANALYTICS AGGREGATES
-- ============================================

-- Creator earnings summary (materialized view alternative)
CREATE TABLE IF NOT EXISTS creator_analytics (
  creator_address VARCHAR(42) PRIMARY KEY REFERENCES creators(address) ON DELETE CASCADE,
  total_sales INTEGER DEFAULT 0,
  total_revenue_usdc DECIMAL(18,6) DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  last_sale_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Search & Discovery indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON product_tags(tag_id);

-- Full-text search index on products
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('english', description));

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_product_analytics_product ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_downloads_buyer ON downloads(buyer_address);
CREATE INDEX IF NOT EXISTS idx_downloads_product ON downloads(product_id);
CREATE INDEX IF NOT EXISTS idx_downloads_purchase ON downloads(purchase_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer ON reviews(buyer_address);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_address);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON wishlists(product_id);

-- Follow indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_address);
CREATE INDEX IF NOT EXISTS idx_follows_creator ON follows(creator_address);

-- Creator analytics indexes
CREATE INDEX IF NOT EXISTS idx_creator_analytics_revenue ON creator_analytics(total_revenue_usdc DESC);
CREATE INDEX IF NOT EXISTS idx_creator_analytics_sales ON creator_analytics(total_sales DESC);
CREATE INDEX IF NOT EXISTS idx_creator_analytics_rating ON creator_analytics(avg_rating DESC);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE ANALYTICS
-- ============================================

-- Update creator analytics on new purchase
CREATE OR REPLACE FUNCTION update_creator_analytics_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO creator_analytics (creator_address, total_sales, total_revenue_usdc, last_sale_at, updated_at)
  SELECT
    p.creator_address,
    1,
    NEW.price_usdc,
    NEW.created_at,
    NOW()
  FROM products p
  WHERE p.id = NEW.product_id
  ON CONFLICT (creator_address) DO UPDATE SET
    total_sales = creator_analytics.total_sales + 1,
    total_revenue_usdc = creator_analytics.total_revenue_usdc + NEW.price_usdc,
    last_sale_at = NEW.created_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_creator_analytics_on_purchase ON purchases;
CREATE TRIGGER trigger_update_creator_analytics_on_purchase
  AFTER INSERT ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_analytics_on_purchase();

-- Update product analytics on view
CREATE OR REPLACE FUNCTION increment_product_views()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO product_analytics (product_id, view_count, last_viewed_at, updated_at)
  VALUES (NEW.id, 1, NOW(), NOW())
  ON CONFLICT (product_id) DO UPDATE SET
    view_count = product_analytics.view_count + 1,
    last_viewed_at = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update product analytics on download
CREATE OR REPLACE FUNCTION increment_product_downloads()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_analytics
  SET
    download_count = download_count + 1,
    last_downloaded_at = NOW(),
    updated_at = NOW()
  WHERE product_id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_product_downloads ON downloads;
CREATE TRIGGER trigger_increment_product_downloads
  AFTER UPDATE OF downloaded_at ON downloads
  FOR EACH ROW
  WHEN (NEW.downloaded_at IS NOT NULL AND OLD.downloaded_at IS NULL)
  EXECUTE FUNCTION increment_product_downloads();

-- Update review helpfulness count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_review_helpful_count ON review_helpful;
CREATE TRIGGER trigger_update_review_helpful_count
  AFTER INSERT OR DELETE ON review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- Update creator follower count
CREATE OR REPLACE FUNCTION update_creator_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO creator_analytics (creator_address, total_followers, updated_at)
    VALUES (NEW.creator_address, 1, NOW())
    ON CONFLICT (creator_address) DO UPDATE SET
      total_followers = creator_analytics.total_followers + 1,
      updated_at = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE creator_analytics
    SET
      total_followers = total_followers - 1,
      updated_at = NOW()
    WHERE creator_address = OLD.creator_address;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_creator_follower_count ON follows;
CREATE TRIGGER trigger_update_creator_follower_count
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_follower_count();

-- Update creator product count
CREATE OR REPLACE FUNCTION update_creator_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO creator_analytics (creator_address, total_products, updated_at)
    VALUES (NEW.creator_address, 1, NOW())
    ON CONFLICT (creator_address) DO UPDATE SET
      total_products = creator_analytics.total_products + 1,
      updated_at = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE creator_analytics
    SET
      total_products = total_products - 1,
      updated_at = NOW()
    WHERE creator_address = OLD.creator_address;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_creator_product_count ON products;
CREATE TRIGGER trigger_update_creator_product_count
  AFTER INSERT OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_product_count();

-- Update creator average rating and review count
CREATE OR REPLACE FUNCTION update_creator_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE creator_analytics ca
  SET
    avg_rating = (
      SELECT ROUND(AVG(r.rating)::numeric, 2)
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE p.creator_address = ca.creator_address
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE p.creator_address = ca.creator_address
    ),
    updated_at = NOW()
  WHERE ca.creator_address IN (
    SELECT p.creator_address
    FROM products p
    WHERE p.id = COALESCE(NEW.product_id, OLD.product_id)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_creator_rating ON reviews;
CREATE TRIGGER trigger_update_creator_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_rating();

-- ============================================
-- SEED DATA (Optional)
-- ============================================

-- Default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Digital Art', 'digital-art', 'Digital artwork, illustrations, and graphics'),
  ('Music', 'music', 'Music tracks, albums, and beats'),
  ('E-books', 'ebooks', 'Digital books and written content'),
  ('Software', 'software', 'Applications, tools, and code'),
  ('Templates', 'templates', 'Design templates and resources'),
  ('Courses', 'courses', 'Educational content and tutorials'),
  ('Photography', 'photography', 'Photos and photography resources'),
  ('3D Models', '3d-models', '3D assets and models'),
  ('Videos', 'videos', 'Video content and stock footage'),
  ('Other', 'other', 'Other digital products')
ON CONFLICT (slug) DO NOTHING;

-- Common tags
INSERT INTO tags (name, slug) VALUES
  ('Premium', 'premium'),
  ('Free', 'free'),
  ('Trending', 'trending'),
  ('New', 'new'),
  ('Featured', 'featured'),
  ('NFT', 'nft'),
  ('AI Generated', 'ai-generated'),
  ('Handmade', 'handmade'),
  ('Open Source', 'open-source'),
  ('Commercial Use', 'commercial-use')
ON CONFLICT (slug) DO NOTHING;
