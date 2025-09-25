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


def Download(link):
    try:
        youtubeObject = YouTube(link, on_progress_callback=progress_function)
        inputTypeDownload = input("Choose format: audio(a) or video(v): ")
        if inputTypeDownload == 'a':
            print("⬇️ Results:")
            audio_streams = youtubeObject.streams.filter(
                only_audio=True, file_extension='mp4')
            print(*audio_streams, sep="\n")
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
            print("⬇️ Results:")
            video_streams = youtubeObject.streams.filter(
                progressive=True, file_extension='mp4')
            print(*video_streams, sep="\n")
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
            # Create MP3 filename
            base_name = os.path.splitext(downloaded_file)[0]
            mp3_file = f"{base_name}.mp3"

            try:
                # Simply rename the file to .mp3 (YouTube audio streams are already compatible)
                os.rename(downloaded_file, mp3_file)
                print(f'✅ Download completed! Audio saved as MP3: {mp3_file}')
            except Exception as conv_error:
                print(f'⚠️  MP3 conversion failed: {str(conv_error)}')
                print(f'✅ File saved as: {downloaded_file}')
        else:
            print(f'✅ Download completed! Video saved to: {downloaded_file}')

    except Exception as e:
        print(f"❌ An error has occurred: {str(e)}")
        print("This might be due to:")
        print("- Invalid YouTube URL")
        print("- Network connectivity issues")
        print("- YouTube blocking the request")
        print("- The video being private or restricted")
