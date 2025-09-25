# 🎬 YouTube Downloader

A simple yet powerful YouTube downloader with command-line shortcuts support!

## Features
- ✅ Download YouTube videos as MP4
- 🎵 Download YouTube audio as MP3 (ALL audio downloads are automatically converted to MP3)
- 🚀 Command-line shortcuts for quick downloads
- 📊 Progress tracking during downloads
- 🎯 Automatic quality selection (best available)
- 🔧 Custom quality selection
- 🔄 Smart file conflict handling

## Installation
1. Clone the repository
2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Interactive Mode (Original)
```bash
python main.py
```

### Command-Line Shortcuts
```bash
# Quick audio download with best quality
python main.py "https://youtube.com/watch?v=VIDEO_ID" --a --best

# Audio with specific quality
python main.py "https://youtube.com/watch?v=VIDEO_ID" --a --quality 128

# Video with best quality  
python main.py "https://youtube.com/watch?v=VIDEO_ID" --v --best

# Video with specific resolution
python main.py "https://youtube.com/watch?v=VIDEO_ID" --v --quality 720
```

### Available Options
- `--a` or `--audio`: Download audio only (ALWAYS saved as MP3)
- `--v` or `--video`: Download video (saved as MP4) 
- `--best`: Use highest quality available
- `--quality XXX`: Specify quality (kbps for audio, resolution for video)

## Examples
```bash
# Download audio in best quality (saved as MP3)
python main.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --a --best

# Download 192kbps audio (saved as MP3)
python main.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --a --quality 192

# Download 1080p video (saved as MP4)
python main.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --v --quality 1080
```

## ⚠️ Important Notes
- **All audio downloads are automatically converted to MP3 format**
- Video downloads remain in MP4 format
- Files with duplicate names get numbered automatically: `filename (1).mp3`
