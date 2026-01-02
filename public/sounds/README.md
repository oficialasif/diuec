# Chat Notification Sounds

This directory contains audio files for chat notifications.

## Default Behavior

Currently, the app uses **Web Audio API** to generate Discord-like notification beeps programmatically. No audio files are required!

## Custom Sounds (Optional)

If you want to use custom sound files instead of beeps, add these files:

### File Names
- `message-send.mp3` - Played when you send a message
- `message-receive.mp3` - Played when you receive a message from others
- `message-delivery.mp3` - Played when message is delivered (optional)

### Requirements
- **Format:** MP3, OGG, or WAV
- **Size:** Keep under 50KB for best performance
- **Duration:** 0.1-0.5 seconds recommended

### Where to Find Sounds

**Free Sound Resources:**
1. **Freesound.org** - https://freesound.org
   - Search: "notification", "beep", "message"
   
2. **Zapsplat** - https://www.zapsplat.com
   - Search: "ui notification"
   
3. **Discord Sound Pack** (for reference)
   - Search online for "Discord notification sounds"

**Discord-like Sound Suggestions:**
- **Send:** Light "whoosh" or "pop" sound (800Hz)
- **Receive:** Two-tone notification (600Hz → 800Hz)
- **Delivery:** Subtle confirmation beep (1000Hz)

### How to Add Custom Sounds

1. Download your sound files
2. Convert to MP3 format if needed
3. Rename them to match the file names above
4. Place them in this `public/sounds/` directory
5. Reload your app - custom sounds will be used automatically!

## Sound Manager Features

✅ **Web Audio API beeps** (works out of the box)
✅ **Custom audio file support** (drop files here)
✅ **Volume control**
✅ **Mute/unmute toggle** (in chat header)
✅ **Persistent preferences** (saved in localStorage)
✅ **No sound for own messages** (only receive sounds for others)

## Browser Compatibility

The sound manager handles browser autoplay policies automatically:
- First sound may require user interaction (clicking, typing)
- Sounds work after initial user interaction
- All modern browsers supported

---

**Note:** If you don't add custom files, the app will continue using Web Audio API beeps, which work great!
