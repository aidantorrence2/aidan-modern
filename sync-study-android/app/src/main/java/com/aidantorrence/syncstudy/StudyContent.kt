package com.aidantorrence.syncstudy

/** Study content for every built-in title. */
val STUDY: Map<String, BookStudy> by lazy {
    listOf(
        CARNEGIE_STUDY,
        ATOMIC_STUDY,
        THINKING_STUDY,
        SAPIENS_STUDY,
        MANS_SEARCH_STUDY,
        MINDSET_STUDY,
        OUTLIERS_STUDY,
    ).associateBy { it.bookId }
}

fun studyFor(bookId: String): BookStudy? = STUDY[bookId]

fun cardById(id: String): Card? = STUDY[id.substringBefore(':')]?.cards?.firstOrNull { it.id == id }
