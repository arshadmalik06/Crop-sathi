import argparse
import glob
import os
import random
import shutil
from pathlib import Path
from typing import List

# Target crops for Jharkhand
JHARKHAND_CROPS = {
    "Rice", "Paddy", "Maize", "Corn", "Tomato", "Potato", "Pepper",
    "Soybean", "Groundnut", "Peanut", "Wheat", "Squash", "Arhar", 
    "PigeonPea", "Chickpea", "Mustard"
}

def is_valid_crop(class_name: str) -> bool:
    """Check if the class name belongs to one of our target crops."""
    # Common format in these datasets is Crop___Disease
    parts = class_name.split("___")
    crop_name = parts[0].replace("_", " ")
    
    # Simple substring check
    for target in JHARKHAND_CROPS:
        if target.lower() in crop_name.lower():
            return True
    return False

def standardize_class_name(class_name: str) -> str:
    """Normalize class names across datasets to Crop___Disease format."""
    class_name = class_name.replace(" ", "_").replace("-", "_")
    # If not using the triple underscore format, attempt to parse
    if "___" not in class_name:
        parts = class_name.split("_", 1)
        if len(parts) == 2:
            return f"{parts[0].capitalize()}___{parts[1]}"
        return class_name
    return class_name

def split_and_copy(images: List[Path], class_name: str, out_dir: Path, split_ratios=(0.8, 0.1, 0.1)):
    """Split images into train/val/test and copy them to the output directory."""
    random.shuffle(images)
    total = len(images)
    train_end = int(total * split_ratios[0])
    val_end = train_end + int(total * split_ratios[1])
    
    splits = {
        "train": images[:train_end],
        "val": images[train_end:val_end],
        "test": images[val_end:]
    }
    
    for split_name, img_paths in splits.items():
        split_dir = out_dir / split_name / class_name
        split_dir.mkdir(parents=True, exist_ok=True)
        for img_path in img_paths:
            # Generate a unique name to avoid collisions across datasets
            unique_name = f"{img_path.parent.name}_{img_path.name}"
            dest_path = split_dir / unique_name
            if not dest_path.exists():
                shutil.copy2(img_path, dest_path)

def process_dataset(dataset_dir: Path, out_dir: Path, source_name: str):
    """Iterates over dataset subfolders (classes) and processes them."""
    print(f"Processing {source_name} from {dataset_dir}...")
    if not dataset_dir.exists():
        print(f"Directory {dataset_dir} not found. Skipping.")
        return

    # Assume standard structure: dataset_dir / ClassName / images.jpg
    class_dirs = [d for d in dataset_dir.iterdir() if d.is_dir()]
    processed_classes = 0
    copied_images = 0
    
    for class_dir in class_dirs:
        class_name = class_dir.name
        if not is_valid_crop(class_name):
            continue
            
        std_class_name = standardize_class_name(class_name)
        
        # Find images
        images = []
        for ext in ["*.jpg", "*.jpeg", "*.png", "*.JPG", "*.PNG"]:
            images.extend(class_dir.glob(ext))
            
        if images:
            split_and_copy(images, std_class_name, out_dir)
            processed_classes += 1
            copied_images += len(images)
            
    print(f"  -> Extracted {copied_images} images across {processed_classes} valid Jharkhand crop classes.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Merge and filter datasets for Jharkhand crop diseases")
    parser.add_argument("--plantvillage", type=str, help="Path to PlantVillage dataset")
    parser.add_argument("--icar", type=str, help="Path to ICAR dataset")
    parser.add_argument("--plantdoc", type=str, help="Path to PlantDoc dataset")
    parser.add_argument("--output", type=str, default="data/jharkhand_disease_dataset", help="Output directory")
    args = parser.parse_args()

    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # We use a fixed seed to ensure reproducibility of the train/val/test splits
    random.seed(42)

    if args.plantvillage:
        process_dataset(Path(args.plantvillage), out_dir, "PlantVillage")
    if args.icar:
        process_dataset(Path(args.icar), out_dir, "ICAR Crop Disease Dataset")
    if args.plantdoc:
        process_dataset(Path(args.plantdoc), out_dir, "PlantDoc")
        
    print(f"\nDone! Dataset prepared at {out_dir.absolute()}")
