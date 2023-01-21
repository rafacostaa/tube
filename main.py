from pytube import YouTube
import ssl
import os.path
import sys
from pathlib import Path

path_to_download_folder = str(os.path.join(Path.home(), "Downloads"))

ssl._create_default_https_context = ssl._create_unverified_context
percentage_of_completion = 0


def progress_function(vid, chunk, bytes_remaining):
    total_size = vid.filesize
    bytes_downloaded = total_size - bytes_remaining
    percentage_of_completion = bytes_downloaded / total_size * 100
    totalsz = (total_size/1024)/1024
    totalsz = round(totalsz, 1)
    remain = (bytes_remaining / 1024) / 1024
    remain = round(remain, 1)
    dwnd = (bytes_downloaded / 1024) / 1024
    dwnd = round(dwnd, 1)
    percentage_of_completion = round(percentage_of_completion, 2)

    # print(f'Total Size: {totalsz} MB')
    # print(f'Download Progress: {percentage_of_completion}%, Downloaded: {dwnd} MB, Remaining:{remain} MB, Total Size:{totalsz} MB')
    print(
        f'Download Progress: {percentage_of_completion}%, Total Size:{totalsz} MB')


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
        # print(result)
        while not result:
            print('😩 Oh shit, I didnt find anything')
            inputKbps = input("📌 Choose quality kbps (eg 192, 160, 128): ")
            result = youtubeObject.streams.filter(
                type='audio', mime_type="audio/mp4", abr=inputKbps+'kbps').first()
            # print(result)

    else:
        typeDownload = 'video'
        print("⬇️ Results:")
        print(*youtubeObject.streams.filter(type='video',
              mime_type="video/mp4"), sep="\n")
        inputRes = input("📌 Choose resolution (eg 1080, 720, 360): ")
        print('🔍 Searching...')
        result = youtubeObject.streams.filter(
            type='video', mime_type="video/mp4", res=inputRes+'p').first()
        # result = youtubeObject.streams.filter(type=typeDownload).get_highest_resolution()
        # print(result)
        while not result:
            print('😩 Oh shit, I didnt find anything')
            inputRes = input("📌 Choose resolution (eg 1080, 720, 360): ")
            result = youtubeObject.streams.filter(
                type='video', mime_type="video/mp4", res=inputRes+'p').first()
            # print(result)

    print('🤓 I found it!')
    print('Starting download...')
    # print(result)

    try:
        result.download(path_to_download_folder)

    except:
        print("An error has occurred")


link = input("Enter the YouTube video URL: ")
Download(link)
