from dictionary import Download
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

link = input("Enter the YouTube video URL: ")
Download(link)
