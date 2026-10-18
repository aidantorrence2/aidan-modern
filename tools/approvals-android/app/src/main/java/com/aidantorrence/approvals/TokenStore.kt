package com.aidantorrence.approvals

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.io.File
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * GitHub token, encrypted with a non-exportable Android Keystore key. Provisioned from the Mac over
 * adb (`install-phone.sh` pipes `gh auth token` into files/token via run-as); on first read the
 * plain file is encrypted into prefs and deleted.
 */
object TokenStore {
    private const val ALIAS = "approvals-token-key"
    private const val PREF = "secure"

    private fun key(): SecretKey {
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (ks.getEntry(ALIAS, null) as? KeyStore.SecretKeyEntry)?.let { return it.secretKey }
        val gen = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        gen.init(KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .build())
        return gen.generateKey()
    }

    fun save(ctx: Context, token: String) {
        val c = Cipher.getInstance("AES/GCM/NoPadding"); c.init(Cipher.ENCRYPT_MODE, key())
        val blob = c.iv + c.doFinal(token.toByteArray(Charsets.UTF_8))
        ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit()
            .putString("token", Base64.encodeToString(blob, Base64.NO_WRAP)).apply()
    }

    fun load(ctx: Context): String? {
        val plain = File(ctx.filesDir, "token")
        if (plain.exists()) {
            val t = plain.readText().trim()
            plain.delete()
            if (t.isNotEmpty()) save(ctx, t)
        }
        val b64 = ctx.getSharedPreferences(PREF, Context.MODE_PRIVATE).getString("token", null) ?: return null
        return try {
            val blob = Base64.decode(b64, Base64.NO_WRAP)
            val c = Cipher.getInstance("AES/GCM/NoPadding")
            c.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, blob, 0, 12))
            String(c.doFinal(blob, 12, blob.size - 12), Charsets.UTF_8)
        } catch (_: Exception) { null }
    }
}
