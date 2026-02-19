#!/bin/bash

echo "🧹 Starting full clean for React Native project..."

# Detect hostname and user
CURRENT_USER=$(whoami)
CURRENT_HOST=$(hostname)

# 🗑️ NPM cache cleanup
echo -e "\n🗑️ Removing global NPM cache..."
npm cache clean --force
rm -rf ~/.npm
sudo chown -R "$USER" ~/.npm 2>/dev/null || true

# 🧰 Yarn cache cleanup (if applicable)
if command -v yarn >/dev/null 2>&1; then
  echo -e "\n🧵 Cleaning Yarn cache..."
  yarn cache clean
fi

# 📦 Node cleanup
echo -e "\n📦 Removing node_modules and lock files..."
rm -rf node_modules
rm -f yarn.lock
rm -f package-lock.json
rm -f Gemfile.lock

# 🧼 Metro + Watchman cleanup
echo -e "\n🧼 Clearing Metro cache and Watchman watches..."
rm -rf ~/.metro-cache
rm -rf $TMPDIR/react-*
watchman watch-del-all 2>/dev/null || true

# 🤖 Android cleanup
echo -e "\n📂 Cleaning Android build and Gradle caches..."
rm -rf android/.gradle
rm -rf android/app/build
rm -rf android/build

# # 🔥 Deep clean Gradle/NDK caches (removes big .so files)
# echo -e "\n💣 Removing global Gradle and Android build caches..."
# rm -rf ~/.gradle/caches/
# rm -rf ~/.gradle/daemon/
# rm -rf ~/.gradle/native/
# rm -rf ~/.gradle/wrapper/
# rm -rf ~/.android/build-cache/

# 🍏 iOS cleanup (only on Fritzz’s Mac)
if [[ "$CURRENT_USER" == "fritzz" && "$CURRENT_HOST" == "Fritzz-MP" ]]; then
  echo -e "\n🍏 Detected $CURRENT_USER's MacBook - Cleaning iOS build folders..."
  rm -rf ios/build
  rm -rf ios/Pods
  rm -rf ios/Podfile.lock
  rm -rf /Users/fritzz/development/DerivedData/*
else
  echo -e "\n🚫 Skipping iOS cleanup - not running on your MacBook."
fi

# 🧩 Clear user caches (macOS global)
echo -e "\n🧩 Clearing macOS user caches..."
rm -rf ~/Library/Caches/* >/dev/null 2>&1

# 📥 Reinstall dependencies
echo -e "\n📥 Reinstalling JS dependencies..."
npm install --legacy-peer-deps

# 💎 Ruby + Bundler
if command -v bundle >/dev/null 2>&1; then
  echo -e "\n💎 Installing Ruby gems..."
  bundle install
fi

# 📦 iOS pods install
if [[ "$CURRENT_USER" == "fritzz" && "$CURRENT_HOST" == "Fritzz-MP" ]]; then
  echo -e "\n📦 Installing iOS pods..."
  cd ios && pod install --repo-update && cd ..
else
  echo -e "\n🚫 Skipping pod install - not running on your MacBook."
fi

# # ⚙️ Pre-download Gradle distribution
# echo -e "\n⚙️ Pre-downloading Gradle (for faster next build)..."
# cd android && ./gradlew --version >/dev/null 2>&1 && cd ..
# echo "✅ Gradle distribution ready."


echo -e "\n✅ All caches and builds cleaned successfully!"