package com.varthanow.news.tts

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

// ============================================================================
// 1. NATIVE ANDROID TELUGU TTS MANAGER (FINAL FALLBACK)
// ============================================================================

class AndroidDeviceTTSManager(private val context: Context) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = TextToSpeech(context, this)
    private var isInitialized = false
    private var teluguSupported = false

    override onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val localeTe = Locale("te", "IN")
            val langResult = tts?.isLanguageAvailable(localeTe)

            when (langResult) {
                TextToSpeech.LANG_AVAILABLE,
                TextToSpeech.LANG_COUNTRY_AVAILABLE,
                TextToSpeech.LANG_COUNTRY_VAR_AVAILABLE -> {
                    tts?.language = localeTe
                    isInitialized = true
                    teluguSupported = true
                }
                TextToSpeech.LANG_MISSING_DATA -> {
                    isInitialized = false
                    teluguSupported = false
                }
                TextToSpeech.LANG_NOT_SUPPORTED -> {
                    isInitialized = false
                    teluguSupported = false
                }
                else -> {
                    isInitialized = false
                    teluguSupported = false
                }
            }
        }
    }

    /**
     * Chunk long Telugu text to prevent speech engine overflow.
     * Uses QUEUE_FLUSH for 1st chunk, QUEUE_ADD for subsequent chunks.
     */
    fun speakTeluguArticle(text: String, speed: Float = 1.0f, onComplete: () -> Unit = {}) {
        if (!isInitialized || tts == null) {
            onComplete()
            return
        }

        tts?.setSpeechRate(speed)
        tts?.setPitch(1.0f)

        // Chunk by Telugu punctuation
        const val maxLen = 400
        val chunks = text.split(Regex("(?<=[।.!?\\n])\\s+"))
        var queueMode = TextToSpeech.QUEUE_FLUSH

        for ((index, chunk) in chunks.withIndex()) {
            if (chunk.isBlank()) continue

            val params = Bundle().apply {
                putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "te_chunk_$index")
            }

            tts?.speak(chunk.trim(), queueMode, params, "te_chunk_$index")
            queueMode = TextToSpeech.QUEUE_ADD // Append remaining chunks continuously
        }

        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}
            override fun onDone(utteranceId: String?) {
                if (utteranceId?.contains("te_chunk_${chunks.size - 1}") == true) {
                    onComplete()
                }
            }
            override fun onError(utteranceId: String?) { onComplete() }
        })
    }

    fun stop() {
        tts?.stop()
    }

    fun release() {
        tts?.stop()
        tts?.shutdown()
    }
}


// ============================================================================
// 2. ARTICLE AUDIO PLAYER VIEWMODEL (FREE-ONLY CLOUD + NATIVE FALLBACK)
// ============================================================================

enum class PlayerState { IDLE, PREPARING, PLAYING, PAUSED, STOPPED, ERROR }

data class TTSBackendResponse(
    val success: Boolean,
    val mode: String, // "CLOUD_AUDIO" or "DEVICE_TTS"
    val audioUrl: String? = null,
    val audioBase64: String? = null,
    val provider: String? = null,
    val cached: Boolean = false,
    val error: String? = null
)

class ArticleAudioPlayerViewModel : ViewModel() {

    private val _playerState = MutableStateFlow(PlayerState.IDLE)
    val playerState: StateFlow<PlayerState> = _playerState

    private val _playbackSpeed = MutableStateFlow(1.0f)
    val playbackSpeed: StateFlow<Float> = _playbackSpeed

    private val _statusText = MutableStateFlow("🔊 వినండి")
    val statusText: StateFlow<String> = _statusText

    private var mediaPlayer: MediaPlayer? = null
    private var nativeTTSManager: AndroidDeviceTTSManager? = null

    fun initializeTTS(context: Context) {
        if (nativeTTSManager == null) {
            nativeTTSManager = AndroidDeviceTTSManager(context)
        }
    }

    /**
     * Check network status: NO INTERNET -> Fallback to Native TTS directly
     */
    private fun isNetworkAvailable(context: Context): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val nw = cm.activeNetwork ?: return false
        val actNw = cm.getNetworkCapabilities(nw) ?: return false
        return actNw.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    fun extract100WordsTeluguSummary(text: String): String {
        val cleanText = text.replace(Regex("<[^>]*>?"), "")
            .replace(Regex("(https?://[^\\s]+)"), "")
            .replace(Regex("\\s+"), " ")
            .trim()
        val words = cleanText.split(Regex("\\s+"))
        return if (words.size <= 100) cleanText else words.take(100).joinToString(" ") + "।"
    }

    fun onPlayClick(
        context: Context, 
        articleId: String, 
        text: String, 
        backendUrl: String, 
        onPlaybackComplete: (() -> Unit)? = null
    ) {
        initializeTTS(context)

        when (_playerState.value) {
            PlayerState.PLAYING -> {
                pauseAudio()
            }
            PlayerState.PAUSED -> {
                resumeAudio()
            }
            else -> {
                val summary100Words = extract100WordsTeluguSummary(text)
                synthesizeAndPlay(context, articleId, summary100Words, backendUrl, onPlaybackComplete)
            }
        }
    }

    private fun synthesizeAndPlay(
        context: Context, 
        articleId: String, 
        text: String, 
        backendUrl: String, 
        onPlaybackComplete: (() -> Unit)? = null
    ) {
        _playerState.value = PlayerState.PREPARING
        _statusText.value = "⏳ ఆడియో సిద్ధమవుతోంది..."

        viewModelScope.launch(Dispatchers.IO) {
            // Check Network Connection
            if (!isNetworkAvailable(context)) {
                // Offline Mode -> Directly use Native Device TTS
                withContext(Dispatchers.Main) {
                    playViaNativeDeviceTTS(text, onPlaybackComplete)
                }
                return@launch
            }

            // Call Backend API
            val response = callTTSBackendApi(backendUrl, articleId, text)

            withContext(Dispatchers.Main) {
                if (response.success && response.mode == "CLOUD_AUDIO" && (!response.audioUrl.isNullOrEmpty() || !response.audioBase64.isNullOrEmpty())) {
                    playCloudAudio(response.audioUrl ?: "data:audio/mp3;base64,${response.audioBase64}", onPlaybackComplete)
                } else {
                    // Fallback to Native Device TTS
                    playViaNativeDeviceTTS(text, onPlaybackComplete)
                }
            }
        }
    }

    private fun callTTSBackendApi(backendUrl: String, articleId: String, text: String): TTSBackendResponse {
        return try {
            val url = URL("$backendUrl/api/tts/synthesize")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true
            conn.connectTimeout = 8000
            conn.readTimeout = 8000

            val jsonBody = JSONObject().apply {
                put("articleId", articleId)
                put("text", text)
                put("language", "te-IN")
            }

            conn.outputStream.use { os ->
                os.write(jsonBody.toString().toByteArray())
            }

            if (conn.responseCode == 200) {
                val responseStr = conn.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(responseStr)
                TTSBackendResponse(
                    success = json.optBoolean("success", true),
                    mode = json.optString("mode", "DEVICE_TTS"),
                    audioUrl = json.optString("audioUrl", null),
                    audioBase64 = json.optString("audioBase64", null),
                    provider = json.optString("provider", null),
                    cached = json.optBoolean("cached", false)
                )
            } else {
                TTSBackendResponse(success = false, mode = "DEVICE_TTS")
            }
        } catch (e: Exception) {
            TTSBackendResponse(success = false, mode = "DEVICE_TTS", error = e.message)
        }
    }

    private fun playCloudAudio(audioSource: String, onPlaybackComplete: (() -> Unit)? = null) {
        try {
            stopAudio()
            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .build()
                )
                setDataSource(audioSource)
                playbackParams = playbackParams.setSpeed(_playbackSpeed.value)
                prepareAsync()
                setOnPreparedListener {
                    start()
                    _playerState.value = PlayerState.PLAYING
                    _statusText.value = "⏸ సంభాషణను ఆపండి"
                }
                setOnCompletionListener {
                    _playerState.value = PlayerState.IDLE
                    _statusText.value = "🔊 వినండి (100 పదాలు)"
                    onPlaybackComplete?.invoke()
                }
            }
        } catch (e: Exception) {
            _playerState.value = PlayerState.ERROR
            _statusText.value = "🔊 వినండి (100 పదాలు)"
        }
    }

    private fun playViaNativeDeviceTTS(text: String, onPlaybackComplete: (() -> Unit)? = null) {
        _playerState.value = PlayerState.PLAYING
        _statusText.value = "⏸ సంభాషణను ఆపండి (ఫోన్ పరికరం)"

        nativeTTSManager?.speakTeluguArticle(text, _playbackSpeed.value) {
            viewModelScope.launch(Dispatchers.Main) {
                _playerState.value = PlayerState.IDLE
                _statusText.value = "🔊 వినండి (100 పదాలు)"
                onPlaybackComplete?.invoke()
            }
        }
    }

    fun pauseAudio() {
        mediaPlayer?.let {
            if (it.isPlaying) {
                it.pause()
                _playerState.value = PlayerState.PAUSED
                _statusText.value = "▶️ కొనసాగించండి"
            }
        }
        nativeTTSManager?.stop()
    }

    fun resumeAudio() {
        mediaPlayer?.let {
            it.start()
            _playerState.value = PlayerState.PLAYING
            _statusText.value = "⏸ సంభాషణను ఆపండి"
        }
    }

    fun stopAudio() {
        mediaPlayer?.stop()
        mediaPlayer?.release()
        mediaPlayer = null
        nativeTTSManager?.stop()
        _playerState.value = PlayerState.IDLE
        _statusText.value = "🔊 వినండి"
    }

    fun setSpeed(speed: Float) {
        _playbackSpeed.value = speed
        mediaPlayer?.let {
            if (it.isPlaying) {
                it.playbackParams = it.playbackParams.setSpeed(speed)
            }
        }
    }

    fun seekRelative(seconds: Int) {
        mediaPlayer?.let {
            val newPos = (it.currentPosition + seconds * 1000).coerceIn(0, it.duration)
            it.seekTo(newPos)
        }
    }

    override fun onCleared() {
        super.onCleared()
        stopAudio()
        nativeTTSManager?.release()
    }
}


// ============================================================================
// 3. JETPACK COMPOSE AUDIO PLAYER UI COMPONENT
// ============================================================================

@Composable
fun ArticleAudioPlayer(
    articleId: String,
    teluguText: String,
    backendUrl: String,
    viewModel: ArticleAudioPlayerViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
) {
    val context = LocalContext.current
    val playerState by viewModel.playerState.collectAsState()
    val playbackSpeed by viewModel.playbackSpeed.collectAsState()
    val statusText by viewModel.statusText.collectAsState()

    DisposableEffect(Unit) {
        viewModel.initializeTTS(context)
        onDispose { viewModel.stopAudio() }
    }

    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Main Listen / Play / Pause Button
                Button(
                    onClick = { viewModel.onPlayClick(context, articleId, teluguText, backendUrl) },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = statusText,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }

                // Stop Button when playing/paused
                if (playerState == PlayerState.PLAYING || playerState == PlayerState.PAUSED) {
                    IconButton(onClick = { viewModel.stopAudio() }) {
                        Text(text = "⏹", fontSize = 18.sp)
                    }
                }
            }

            // Speed Control & 15s Skip Controls (Visible during playback)
            AnimatedVisibility(visible = playerState == PlayerState.PLAYING || playerState == PlayerState.PAUSED) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 12.dp)
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        TextButton(onClick = { viewModel.seekRelative(-15) }) {
                            Text("⏪ -15s", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        TextButton(onClick = { viewModel.seekRelative(15) }) {
                            Text("⏩ +15s", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    // Speed Selector Chips
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        listOf(0.75f, 1.0f, 1.25f, 1.5f, 2.0f).forEach { speed ->
                            FilterChip(
                                selected = playbackSpeed == speed,
                                onClick = { viewModel.setSpeed(speed) },
                                label = { Text("${speed}x", fontSize = 11.sp) }
                            )
                        }
                    }
                }
            }
        }
    }
}
