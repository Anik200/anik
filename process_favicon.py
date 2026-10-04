from PIL import Image, ImageOps, ImageDraw

def add_blue_border(input_path, output_path, border_width=10, color=(0, 120, 215)):
    # Open the image
    img = Image.open(input_path).convert("RGBA")
    
    # Calculate new dimensions
    width, height = img.size
    
    # Create a new image with border size
    # We want a circular border usually for avatars
    mask = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, width, height), fill=255)
    
    # Apply circular mask to original image
    circular_img = ImageOps.fit(img, mask.size, centering=(0.5, 0.5))
    circular_img.putalpha(mask)
    
    # Create the final icon canvas with extra space for border
    new_size = (width + border_width * 2, height + border_width * 2)
    final_img = Image.new("RGBA", new_size, (0, 0, 0, 0))
    
    # Draw the blue circle background
    draw_final = ImageDraw.Draw(final_img)
    draw_final.ellipse((0, 0, new_size[0], new_size[1]), fill=color)
    
    # Paste the original circular image in the center
    final_img.paste(circular_img, (border_width, border_width), circular_img)
    
    # Save as PNG
    final_img.save(output_path)

if __name__ == "__main__":
    add_blue_border("img/avatar.png", "img/favicon.png", border_width=20)
