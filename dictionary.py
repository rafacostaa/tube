from pytube import YouTube
from pathlib import Path
import os.path

path_to_download_folder = str(os.path.join(Path.home(), "Downloads"))
percentage_of_completion = 0


def Download(link):
    youtubeObject = YouTube(link, on_progress_callback=progress_function)
    inputTypeDownload = input("Choose format: audio(a) or video(v): ")
    if inputTypeDownload == 'a':
        print("⬇️ Results:")
        print(*youtubeObject.streams.filter(type='audio',
              mime_type="audio/mp4"), sep="\n")
        inputKbps = input("📌 Choose quality kbps (eg 192, 160, 128): ")
        print('🔍 Searching...')
        result = youtubeObject.streams.filter(
            type='audio', mime_type="audio/mp4", abr=inputKbps+'kbps').first()
        while not result:
            print('😩 Oh shit, I didnt find anything')
            inputKbps = input("📌 Choose quality kbps (eg 192, 160, 128): ")
            result = youtubeObject.streams.filter(
                type='audio', mime_type="audio/mp4", abr=inputKbps+'kbps').first()

    else:
        typeDownload = 'video'
        print("⬇️ Results:")
        print(*youtubeObject.streams.filter(type='video',
              mime_type="video/mp4"), sep="\n")
        inputRes = input("📌 Choose resolution (eg 1080, 720, 360): ")
        print('🔍 Searching...')
        result = youtubeObject.streams.filter(
            type='video', mime_type="video/mp4", res=inputRes+'p').first()
        while not result:
            print('😩 Oh shit, I didnt find anything')
            inputRes = input("📌 Choose resolution (eg 1080, 720, 360): ")
            result = youtubeObject.streams.filter(
                type='video', mime_type="video/mp4", res=inputRes+'p').first()

    print('🤓 I found it!')
    print('Starting download...')

    try:
        result.download(path_to_download_folder)

    except:
        print("An error has occurred")


def progress_function(vid, chunk, bytes_remaining):
    total_size = vid.filesize
    bytes_downloaded = total_size - bytes_remaining
    totalsz = round(((total_size/1024)/1024), 1)
    remain = round(((bytes_remaining / 1024) / 1024), 1)
    dwnd = round(((bytes_downloaded / 1024) / 1024), 1)
    percentage_of_completion = round((bytes_downloaded / total_size * 100), 2)

    print(
        f'Download Progress: {percentage_of_completion}%, Total Size:{totalsz} MB')
