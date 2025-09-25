# YouTube Downloader - Usage Examples

## Interactive Mode (Original)
```bash
python main.py
```
Then follow the prompts.

## Command Line Shortcuts

### Audio Downloads
```bash
# Download audio with best quality
python main.py "https://youtube.com/watch?v=VIDEO_ID" --a --best

# Download audio with specific quality
python main.py "https://youtube.com/watch?v=VIDEO_ID" --a --quality 128

# Just specify audio (will ask for quality)
python main.py "https://youtube.com/watch?v=VIDEO_ID" --a
```

### Video Downloads
```bash
# Download video with best quality
python main.py "https://youtube.com/watch?v=VIDEO_ID" --v --best

# Download video with specific quality
python main.py "https://youtube.com/watch?v=VIDEO_ID" --v --quality 720

# Just specify video (will ask for quality)
python main.py "https://youtube.com/watch?v=VIDEO_ID" --v
```

### Available Options
- `--a` or `--audio`: Download audio only (saves as MP3)
- `--v` or `--video`: Download video (saves as MP4)
- `--best`: Use highest quality available
- `--quality XXX`: Use specific quality (kbps for audio, resolution for video)

### Examples
```bash
# Quick audio download with best quality
python main.py "https://youtube.com/watch?v=5iWrT81xXZ0" --a --best

# Specific audio quality
python main.py "https://youtube.com/watch?v=5iWrT81xXZ0" --a --quality 192

# Best video quality
python main.py "https://youtube.com/watch?v=5iWrT81xXZ0" --v --best

# Specific video resolution
python main.py "https://youtube.com/watch?v=5iWrT81xXZ0" --v --quality 1080
```