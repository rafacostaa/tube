from pytubefix import YouTube
import ssl
import os.path
import sys
from pathlib import Path
from dictionary import Download
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
    print(
        f'Download Progress: {percentage_of_completion}%, Downloaded: {dwnd} MB, Remaining:{remain} MB, Total Size:{totalsz} MB')


# def Download(link):
#     youtubeObject = YouTube(link, on_progress_callback=progress_function)
#     youtubeObject = youtubeObject.streams.get_highest_resolution()
#     try:
#         youtubeObject.download(path_to_download_folder)

#     except:
#         print("An error has occurred")


link = input("Enter the YouTube video URL: ")
print('Wait please...')


Download(link)
