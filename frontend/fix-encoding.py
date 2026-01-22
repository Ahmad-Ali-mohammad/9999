# -*- coding: utf-8 -*-
import codecs

# Read file with broken encoding and decode correctly
with open('src/contexts/LanguageContext.tsx', 'rb') as f:
    content = f.read()

# Try to decode as UTF-8
try:
    # The content is already UTF-8 but displaying wrongly
    text = content.decode('utf-8')
    
    # Write back with proper UTF-8 encoding
    with codecs.open('src/contexts/LanguageContext_fixed.tsx', 'w', 'utf-8-sig') as f:
        f.write(text)
    
    print("✓ File encoding fixed successfully")
except Exception as e:
    print(f"✗ Error: {e}")
