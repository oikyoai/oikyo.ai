source "https://rubygems.org"

# Use Jekyll 4 for better performance and features
gem "jekyll", "~> 4.3.0"

# Theme
gem "minima", "~> 2.5"

# Jekyll plugins for SEO and functionality
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"
  gem "jekyll-sitemap", "~> 1.4"
  gem "jekyll-seo-tag", "~> 2.8"
end

# Windows and JRuby does not include zoneinfo files
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.0", :install_if => Gem.win_platform?

# For Ruby 3.0+
gem "webrick", "~> 1.8"
