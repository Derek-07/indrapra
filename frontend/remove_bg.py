from PIL import Image
import os

def remove_black_bg(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return
        
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    # threshold for considering a pixel "black"
    threshold = 40
    for item in datas:
        # item is (R, G, B, A)
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            # make it transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Successfully saved transparent logo to {output_path}")

remove_black_bg("asset/image/logo/logo.png", "asset/image/logo/logo_transparent.png")
