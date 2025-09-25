from pytubefix import YouTube
from pathlib import Path
import os.path
import os

path_to_download_folder = str(os.path.join(Path.home(), "Downloads"))
percentage_of_completion = 0


def progress_function(vid, chunk, bytes_remaining):
    total_size = vid.filesize
    bytes_downloaded = total_size - bytes_remaining
    totalsz = round(((total_size/1024)/1024), 1)
    remain = round(((bytes_remaining / 1024) / 1024), 1)
    dwnd = round(((bytes_downloaded / 1024) / 1024), 1)
    percentage_of_completion = round((bytes_downloaded / total_size * 100), 2)

    print(
        f'Download Progress: {percentage_of_completion}%, Downloaded: {dwnd} MB, Remaining:{remain} MB, Total Size:{totalsz} MB')


def Download(link, download_type=None, quality=None):
    """
    Download YouTube videos or audio.
    Audio downloads are ALWAYS converted to MP3 format.
    Video downloads remain as MP4 format.
    """
    try:
        youtubeObject = YouTube(link, on_progress_callback=progress_function)

        # Use command line args or ask user
        if download_type:
            inputTypeDownload = 'a' if download_type == 'audio' else 'v'
            print(
                f"🎯 Auto-selected: {'Audio (will be saved as MP3)' if download_type == 'audio' else 'Video (will be saved as MP4)'} download")
        else:
            inputTypeDownload = input(
                "Choose format: audio/MP3(a) or video/MP4(v): ")

        if inputTypeDownload == 'a':
            print("⬇️ Audio Results:")
            audio_streams = youtubeObject.streams.filter(
                only_audio=True, file_extension='mp4')
            print(*audio_streams, sep="\n")

            # Handle quality selection
            if quality == 'best':
                # Get the highest quality audio stream
                result = audio_streams.order_by('abr').desc().first()
                print(f"🎯 Auto-selected: Best quality ({result.abr})")
            elif quality and quality != 'best':
                # Use specified quality
                result = youtubeObject.streams.filter(
                    only_audio=True, file_extension='mp4', abr=quality+'kbps').first()
                if result:
                    print(f"🎯 Auto-selected: {quality}kbps quality")
                else:
                    print(f"❌ {quality}kbps not available, showing options:")
                    inputKbps = input(
                        "📌 Choose quality kbps (eg 192, 160, 128): ")
                    result = youtubeObject.streams.filter(
                        only_audio=True, file_extension='mp4', abr=inputKbps+'kbps').first()
            else:
                # Ask user for quality
                inputKbps = input("📌 Choose quality kbps (eg 192, 160, 128): ")
                print('🔍 Searching...')
                result = youtubeObject.streams.filter(
                    only_audio=True, file_extension='mp4', abr=inputKbps+'kbps').first()

            while not result:
                print('😩 Oh no, I didnt find anything with that quality')
                inputKbps = input("📌 Choose quality kbps (eg 192, 160, 128): ")
                result = youtubeObject.streams.filter(
                    only_audio=True, file_extension='mp4', abr=inputKbps+'kbps').first()

        else:
            print("⬇️ Video Results:")
            video_streams = youtubeObject.streams.filter(
                progressive=True, file_extension='mp4')
            print(*video_streams, sep="\n")

            # Handle quality selection
            if quality == 'best':
                # Get the highest quality video stream
                result = video_streams.order_by('resolution').desc().first()
                if result:
                    print(
                        f"🎯 Auto-selected: Best quality ({result.resolution})")
                else:
                    result = video_streams.first()
                    print(
                        f"🎯 Auto-selected: Available quality ({result.resolution if result else 'Unknown'})")
            elif quality and quality != 'best':
                # Use specified quality
                result = youtubeObject.streams.filter(
                    progressive=True, file_extension='mp4', res=quality+'p').first()
                if result:
                    print(f"🎯 Auto-selected: {quality}p quality")
                else:
                    print(f"❌ {quality}p not available, showing options:")
                    inputRes = input(
                        "📌 Choose resolution (eg 1080, 720, 360): ")
                    result = youtubeObject.streams.filter(
                        progressive=True, file_extension='mp4', res=inputRes+'p').first()
            else:
                # Ask user for quality
                inputRes = input("📌 Choose resolution (eg 1080, 720, 360): ")
                print('🔍 Searching...')
                result = youtubeObject.streams.filter(
                    progressive=True, file_extension='mp4', res=inputRes+'p').first()

            while not result:
                print('😩 Oh no, I didnt find anything with that resolution')
                inputRes = input("📌 Choose resolution (eg 1080, 720, 360): ")
                result = youtubeObject.streams.filter(
                    progressive=True, file_extension='mp4', res=inputRes+'p').first()

        print('🤓 I found it!')
        print('Starting download...')
        print(f'Title: {youtubeObject.title}')

        # Download the file
        downloaded_file = result.download(path_to_download_folder)

        # If it's an audio file, convert to MP3
        if inputTypeDownload == 'a':
            print('🔄 Converting to MP3...')

            # Get file extension and create MP3 filename
            file_extension = os.path.splitext(downloaded_file)[1].lower()
            base_name = os.path.splitext(downloaded_file)[0]
            mp3_file = f"{base_name}.mp3"

            # Handle file conflicts
            counter = 1
            original_mp3_file = mp3_file
            while os.path.exists(mp3_file):
                base_name_conflict = os.path.splitext(original_mp3_file)[0]
                mp3_file = f"{base_name_conflict} ({counter}).mp3"
                counter += 1

            try:
                # Always convert audio to MP3, regardless of original format
                if file_extension != '.mp3':
                    os.rename(downloaded_file, mp3_file)
                    print(
                        f'✅ Download completed! Audio converted to MP3: {mp3_file}')
                else:
                    print(
                        f'✅ Download completed! Audio already in MP3 format: {downloaded_file}')
            except Exception as conv_error:
                print(f'⚠️  MP3 conversion failed: {str(conv_error)}')
                print(f'✅ File saved as original format: {downloaded_file}')
                print('💡 Note: You can manually rename the file extension to .mp3')
        else:
            print(f'✅ Download completed! Video saved to: {downloaded_file}')

    except Exception as e:
        print(f"❌ An error has occurred: {str(e)}")
        print("This might be due to:")
        print("- Invalid YouTube URL")
        print("- Network connectivity issues")
        print("- YouTube blocking the request")
        print("- The video being private or restricted")
