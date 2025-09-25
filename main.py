from pytubefix import YouTube
import ssl
import os.path
import sys
from pathlib import Path
from dictionary import Download

# Fix SSL certificate issues
ssl._create_default_https_context = ssl._create_unverified_context


def main():
    print("🎬 YouTube Downloader")
    print("====================")
    link = input("Enter the YouTube video URL: ")

    if not link.strip():
        print("❌ Please provide a valid URL")
        return

    print('⏳ Wait please...')
    Download(link)


if __name__ == "__main__":
    main()
