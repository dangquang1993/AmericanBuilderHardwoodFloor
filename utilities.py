import os
import time

def rename_files(folder_path, prefix):
    # List all files in the directory
    files = os.listdir(folder_path)
    i = 0
    for file_name in files:
        # Construct full file path
        file_path = os.path.join(folder_path, file_name)
        
        # Skip directories
        if not os.path.isfile(file_path):
            continue
        
        # Get creation time
        creation_time = os.path.getctime(file_path)
        
        # Format creation time as a number (e.g., timestamp)
        creation_number = int(creation_time)
        
        # Construct new file name
        new_file_name = f"{prefix}_{i}.jpg"
        
        # Construct new file path
        new_file_path = os.path.join(folder_path, new_file_name)
        
        # Rename the file
        os.rename(file_path, new_file_path)
        print(f"Renamed {file_name} to {new_file_name}")
        i = i+1

# # Define folder paths
# folder1_path = 'img/various/full'
# folder2_path = 'img/various/thumb'

# # Rename files in both folders
# rename_files(folder1_path, 'Portfolio_img')
# rename_files(folder2_path, 'Portfolio_img')

#############################################################################

from PIL import Image
import os

def resize_images(folder_path, size=(360, 360)):
    # List all files in the directory
    files = os.listdir(folder_path)
    
    for file_name in files:
        # Construct full file path
        file_path = os.path.join(folder_path, file_name)
        
        # Open and resize image if it's a valid image file
        try:
            with Image.open(file_path) as img:
                # Resize image
                img = img.resize(size, Image.ANTIALIAS)
                
                # Save image
                img.save(file_path)
                print(f"Resized {file_name}")
        except IOError:
            print(f"Cannot resize {file_name}: Not a valid image file")

# Define folder path
folder_path = 'img/various/thumb'

# Resize images in the folder
resize_images(folder_path)