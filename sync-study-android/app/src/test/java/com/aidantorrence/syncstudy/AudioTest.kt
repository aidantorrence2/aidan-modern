package com.aidantorrence.syncstudy

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AudioTest {
    @Test fun maleVoicesAreRecognisedByName() {
        listOf("en-us-x-iom-local", "en-us-x-tpd-network", "en-gb-x-rjs-local", "en-AU-language#male_1-local", "en-us-x-iol-local")
            .forEach { assertTrue(it, soundsMale(it)) }
        listOf("en-us-x-sfg-local", "en-us-x-tpf-local", "en-US-language", "en-gb-x-gba-local", "en-us-x-female_2", "Samantha")
            .forEach { assertFalse(it, soundsMale(it)) }
    }
}
