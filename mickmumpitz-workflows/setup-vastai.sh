#!/bin/bash
# MICKMUMPITZ Flux Kontext Full Setup for Vast.ai
# Run this in Jupyter terminal on your Vast.ai instance

set -e
echo "=== MICKMUMPITZ SETUP STARTING ==="

# Kill any running ComfyUI first
fuser -k 8188/tcp 2>/dev/null || true
sleep 2

cd /workspace/ComfyUI

# ============================================
# 1. INSTALL CUSTOM NODES
# ============================================
echo "=== Installing Custom Nodes ==="
cd custom_nodes

# AdvancedLivePortrait (ExpressionEditor)
if [ ! -d "ComfyUI-AdvancedLivePortrait" ]; then
  git clone https://github.com/PowerHouseMan/ComfyUI-AdvancedLivePortrait.git
  cd ComfyUI-AdvancedLivePortrait && pip install -r requirements.txt 2>/dev/null; cd ..
fi

# KJNodes
if [ ! -d "ComfyUI-KJNodes" ]; then
  git clone https://github.com/kijai/ComfyUI-KJNodes.git
  cd ComfyUI-KJNodes && pip install -r requirements.txt 2>/dev/null; cd ..
fi

# rgthree (Labels, Power Lora Loader)
if [ ! -d "rgthree-comfy" ]; then
  git clone https://github.com/rgthree/rgthree-comfy.git
fi

# ControlNet Aux (DWPreprocessor)
if [ ! -d "comfyui_controlnet_aux" ]; then
  git clone https://github.com/Fannovel16/comfyui_controlnet_aux.git
  cd comfyui_controlnet_aux && pip install -r requirements.txt 2>/dev/null; cd ..
fi

# Impact Pack
if [ ! -d "ComfyUI-Impact-Pack" ]; then
  git clone https://github.com/ltdrdata/ComfyUI-Impact-Pack.git
  cd ComfyUI-Impact-Pack && pip install -r requirements.txt 2>/dev/null; cd ..
fi

# Florence2
if [ ! -d "ComfyUI-Florence2" ]; then
  git clone https://github.com/kijai/ComfyUI-Florence2.git
  cd ComfyUI-Florence2 && pip install -r requirements.txt 2>/dev/null; cd ..
fi

# WAS Node Suite (Image Lucy Sharpen, Bloom, Chromatic Aberration)
if [ ! -d "was-node-suite-comfyui" ]; then
  git clone https://github.com/WASasquatch/was-node-suite-comfyui.git
  cd was-node-suite-comfyui && pip install -r requirements.txt 2>/dev/null; cd ..
fi

# RES4LYF (Film Grain)
if [ ! -d "RES4LYF" ]; then
  git clone https://github.com/ClownsharkBatwing/RES4LYF.git
  cd RES4LYF && pip install -r requirements.txt 2>/dev/null; cd ..
fi

# ComfyUI Image Saver (Seed Generator)
if [ ! -d "comfyui-image-saver" ]; then
  git clone https://github.com/alexopus/ComfyUI-Image-Saver.git comfyui-image-saver
fi

# Frame Interpolation (FILM VFI for video)
if [ ! -d "ComfyUI-Frame-Interpolation" ]; then
  git clone https://github.com/Fannovel16/ComfyUI-Frame-Interpolation.git
  cd ComfyUI-Frame-Interpolation && pip install -r requirements.txt 2>/dev/null; cd ..
fi

# VideoHelperSuite
if [ ! -d "ComfyUI-VideoHelperSuite" ]; then
  git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git
  cd ComfyUI-VideoHelperSuite && pip install -r requirements.txt 2>/dev/null; cd ..
fi

echo "=== Custom Nodes Installed ==="

# ============================================
# 2. DOWNLOAD MODELS
# ============================================
cd /workspace/ComfyUI

echo "=== Downloading Flux Kontext Dev ==="
# Flux Kontext Dev (needs HuggingFace token)
if [ ! -f "models/diffusion_models/flux1-kontext-dev.safetensors" ]; then
  mkdir -p models/diffusion_models
  wget --header="Authorization: Bearer $HF_TOKEN" \
    -O models/diffusion_models/flux1-kontext-dev.safetensors \
    "https://huggingface.co/black-forest-labs/FLUX.1-Kontext-dev/resolve/main/flux1-kontext-dev.safetensors"
fi

echo "=== Downloading Qwen CLIP + VAE ==="
# Qwen 2.5 VL 7B fp8 CLIP
mkdir -p models/clip/qwen
if [ ! -f "models/clip/qwen/qwen_2.5_vl_7b_fp8_scaled.safetensors" ]; then
  wget -O models/clip/qwen/qwen_2.5_vl_7b_fp8_scaled.safetensors \
    "https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors"
fi

# Qwen Image VAE
if [ ! -f "models/vae/qwen/qwen_image_vae.safetensors" ]; then
  mkdir -p models/vae/qwen
  wget -O models/vae/qwen/qwen_image_vae.safetensors \
    "https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors"
fi

echo "=== Downloading Upscaler + Projector + SigCLIP ==="
# 4x-UltraSharp upscaler
mkdir -p models/upscale_models
if [ ! -f "models/upscale_models/4x-UltraSharp.pth" ]; then
  wget -O models/upscale_models/4x-UltraSharp.pth \
    "https://huggingface.co/Kim2091/UltraSharp/resolve/main/4x-UltraSharp.pth"
fi

# USO Flux Projector
mkdir -p models/model_patches
if [ ! -f "models/model_patches/uso-flux1-projector-v1.safetensors" ]; then
  wget -O models/model_patches/uso-flux1-projector-v1.safetensors \
    "https://huggingface.co/Comfy-Org/USO_1.0_Repackaged/resolve/main/split_files/model_patches/uso-flux1-projector-v1.safetensors"
fi

# SigCLIP Vision
mkdir -p models/clip_vision
if [ ! -f "models/clip_vision/sigclip_vision_patch14_384.safetensors" ]; then
  wget -O models/clip_vision/sigclip_vision_patch14_384.safetensors \
    "https://huggingface.co/Comfy-Org/sigclip_vision_384/resolve/main/sigclip_vision_patch14_384.safetensors"
fi

# USO LoRA (for dataset creation)
mkdir -p models/loras
if [ ! -f "models/loras/uso-flux1-dit-lora-v1.safetensors" ]; then
  wget -O models/loras/uso-flux1-dit-lora-v1.safetensors \
    "https://huggingface.co/Comfy-Org/USO_1.0_Repackaged/resolve/main/split_files/loras/uso-flux1-dit-lora-v1.safetensors"
fi

echo "=== Downloading Flux Dev fp8 (base checkpoint for Kontext) ==="
mkdir -p models/checkpoints/flux
if [ ! -f "models/checkpoints/flux/flux1-dev-fp8.safetensors" ]; then
  # Check if it exists in the old location
  if [ -f "models/checkpoints/flux1-dev-fp8.safetensors" ]; then
    ln -s /workspace/ComfyUI/models/checkpoints/flux1-dev-fp8.safetensors models/checkpoints/flux/flux1-dev-fp8.safetensors
  else
    wget -O models/checkpoints/flux/flux1-dev-fp8.safetensors \
      "https://huggingface.co/Comfy-Org/flux1-dev/resolve/main/flux1-dev-fp8.safetensors"
  fi
fi

echo ""
echo "=== SETUP COMPLETE ==="
echo ""
echo "Models downloaded. Now:"
echo "1. Restart ComfyUI"
echo "2. Upload the 3 Flux Kontext workflow JSONs"
echo "3. Make sure your NSFW LoRA is in models/loras/"
echo "4. Load your character reference photo"
echo ""
echo "Note: Florence2 model will auto-download on first use (~4GB)"
echo "Note: AdvancedLivePortrait models will auto-download on first use"
