import os
import re

models_dir = r"d:\3dfv\backend\app\models"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '| None' in content:
        # We need to make sure Optional is imported
        if 'from typing import Optional' not in content:
            # add import after imports
            content = "from typing import Optional\n" + content
        
        # replace Mapped[X | None] with Mapped[Optional[X]]
        # Also handle Mapped[X|None] just in case
        new_content = re.sub(r'Mapped\[(.*?)\s*\|\s*None\]', r'Mapped[Optional[\1]]', content)
        new_content = re.sub(r'Mapped\[None\s*\|\s*(.*?)\]', r'Mapped[Optional[\1]]', new_content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed {filepath}")

for filename in os.listdir(models_dir):
    if filename.endswith(".py"):
        fix_file(os.path.join(models_dir, filename))
