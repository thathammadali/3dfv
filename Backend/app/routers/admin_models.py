import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.core.permissions import require_roles
from app.models.user import User
from app.utils.response import success_response

router = APIRouter(prefix="/admin/models", tags=["admin_models"])
content_admin = require_roles("content_admin", "super_admin")

MODELS_DIR = "app/3dmodels"

@router.get("")
def list_models(_: User = Depends(content_admin)) -> dict:
    if not os.path.exists(MODELS_DIR):
        return success_response(data=[])
    
    files = []
    for file in os.listdir(MODELS_DIR):
        if file.endswith((".glb", ".gltf")):
            files.append(file)
            
    return success_response(data=files)

@router.post("/upload")
def upload_model(file: UploadFile = File(...), _: User = Depends(content_admin)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
        
    if not file.filename.endswith((".glb", ".gltf")):
        raise HTTPException(status_code=400, detail="Only .glb and .gltf files are supported")
        
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # Replace spaces with underscores for safer URLs
    safe_filename = file.filename.replace(" ", "_")
    file_path = os.path.join(MODELS_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return success_response("Model uploaded successfully", data={"filename": safe_filename})
