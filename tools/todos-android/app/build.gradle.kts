plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// The phone's private key (the Mac encrypts each list to the matching public key in
// tools/todos/build-todos.mjs) is baked into the APK, so the phone needs no setup. Never commit an APK.
val todoKey: String = (project.findProperty("todoKey") as String?) ?: System.getenv("TODOS_PRIVATE_KEY")
    ?: file("${System.getProperty("user.home")}/.config/aidan-todos/phone-private.b64").takeIf { it.exists() }?.readText()?.trim() ?: ""

android {
    buildFeatures { buildConfig = true }
    namespace = "com.aidantorrence.todos"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.aidantorrence.todos"
        minSdk = 29
        targetSdk = 34
        versionCode = 1
        versionName = "1.1"
        buildConfigField("String", "LIST_KEY", "\"$todoKey\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

// Framework views only: no AndroidX, nothing to resolve beyond the Kotlin stdlib.
dependencies {}
