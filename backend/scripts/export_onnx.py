import argparse
import os

import torch
import torch.nn as nn
from torchvision import models

def export_to_onnx(model_path: str, output_path: str, num_classes: int):
    print(f"Loading ResNet50 model from {model_path}...")
    
    # Initialize the model structure
    model = models.resnet50(weights=None)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, num_classes)
    
    # Load the trained weights
    device = torch.device('cpu')
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()

    # Create dummy input that matches the input shape the model expects (Batch_Size, Channels, Height, Width)
    # The Crop-sathi backend resizes inputs to 256x256 before inference.
    dummy_input = torch.randn(1, 3, 256, 256, device=device)

    print(f"Exporting to ONNX at {output_path}...")
    torch.onnx.export(
        model, 
        dummy_input, 
        output_path, 
        export_params=True,
        opset_version=12,
        do_constant_folding=True,
        input_names=['input'], 
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )
    print("Export successful!")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Export trained PyTorch ResNet50 to ONNX')
    parser.add_argument('--model_path', type=str, default='models/jharkhand_resnet50.pth', help='Path to the .pth model')
    parser.add_argument('--output_path', type=str, default='models/resnet50_plant_disease.onnx', help='Path to save the .onnx model')
    parser.add_argument('--num_classes', type=int, required=True, help='Number of classes the model was trained on')
    args = parser.parse_args()

    if not os.path.exists(args.model_path):
        raise FileNotFoundError(f"Could not find model weights at {args.model_path}")
        
    export_to_onnx(args.model_path, args.output_path, args.num_classes)
