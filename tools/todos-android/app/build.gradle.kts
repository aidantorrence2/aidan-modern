plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// The current list (data/todos.json) is bundled into the APK so the app shows cards the moment it opens.
val bundleTodos = tasks.register<Copy>("bundleTodos") {
    from(rootProject.file("../../data/todos.json"))
    into(layout.buildDirectory.dir("bundled-assets"))
}
tasks.matching { it.name == "preBuild" }.configureEach { dependsOn(bundleTodos) }

android {
    sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("bundled-assets"))
    namespace = "com.aidantorrence.todos"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.aidantorrence.todos"
        minSdk = 29
        targetSdk = 34
        versionCode = 4
        versionName = "1.4"
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
