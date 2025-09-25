from pytubefix import YouTube
import ssl
import os.path
import sys
import argparse
from pathlib import Path
from dictionary import Download

# Fix SSL certificate issues
ssl._create_default_https_context = ssl._create_unverified_context


def parse_arguments():
    parser = argparse.ArgumentParser(
        description='🎬 YouTube Downloader with shortcuts')
    parser.add_argument('url', nargs='?', help='YouTube video URL')
    parser.add_argument('--a', '--audio', action='store_true',
                        help='Download audio only')
    parser.add_argument(
        '--v', '--video', action='store_true', help='Download video')
    parser.add_argument('--best', action='store_true',
                        help='Download best quality available')
    parser.add_argument('--quality', type=str,
                        help='Specify quality (e.g., 128, 192, 320 for audio or 720, 1080 for video)')

    return parser.parse_args()


def main():
    print("🎬 YouTube Downloader")
    print("====================")

    args = parse_arguments()

    # Get URL from command line or ask user
    if args.url:
        link = args.url
        print(f"📎 URL: {link}")
    else:
        link = input("Enter the YouTube video URL: ")

    if not link.strip():
        print("❌ Please provide a valid URL")
        return

    # Determine download options from arguments
    download_type = None
    quality = None

    if args.a:
        download_type = 'audio'
        if args.best:
            quality = 'best'
        elif args.quality:
            quality = args.quality
    elif args.v:
        download_type = 'video'
        if args.best:
            quality = 'best'
        elif args.quality:
            quality = args.quality

    print('⏳ Wait please...')
    Download(link, download_type, quality)


if __name__ == "__main__":
    main()
