
import React, { useRef, useState } from 'react';
import { Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadButtonProps {
  onImageUpload: (file: File) => void;
  isUploading?: boolean;
  className?: string;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ 
  onImageUpload, 
  isUploading = false,
  className 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <Button 
        type="button" 
        variant="ghost" 
        size="icon" 
        className="h-10 w-10 rounded-full text-blue-500 hover:bg-blue-100 hover:text-blue-600"
        onClick={handleButtonClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Image className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default ImageUploadButton;
