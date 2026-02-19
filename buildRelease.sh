# adb uninstall com.ipark.app || echo "App not installed, skipping uninstall"; 
cd android && ./gradlew clean && ./gradlew assembleRelease && cd .. && adb install android/app/build/outputs/apk/release/app-release.apk
