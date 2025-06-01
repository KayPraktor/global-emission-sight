
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download } from 'lucide-react';
import { downloadTemplate, duplicateTemplate, Template } from '@/services/templateService';

interface TemplateCardProps {
  template: Template;
  onPreview: (template: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPreview }) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  const formats = template.format.split(',').map(f => f.trim());
  const hasMultipleFormats = formats.length > 1;

  const handleDownload = async () => {
    if (hasMultipleFormats && !selectedFormat) {
      return; // Format selection required
    }
    
    setIsDownloading(true);
    try {
      await downloadTemplate(template, selectedFormat || formats[0]);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDuplicate = () => {
    duplicateTemplate(template);
  };

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${!template.available ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium">{template.title}</CardTitle>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs">
              {template.categories[0].toUpperCase()}
            </Badge>
            {!template.available && (
              <Badge variant="destructive" className="text-xs">
                Unavailable
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-xs mt-1.5">{template.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="aspect-video bg-muted flex items-center justify-center relative group">
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground font-medium">{template.title}</p>
            <p className="text-xs text-muted-foreground mt-1">Preview Template</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" size="sm" onClick={() => onPreview(template)}>
              Preview Template
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Format</p>
              <p className="font-medium">{template.format}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">{template.lastUpdated}</p>
            </div>
          </div>
          
          {hasMultipleFormats && (
            <div className="mt-3">
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 px-4 border-t">
        <div className="flex justify-between items-center w-full">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDuplicate}
            disabled={!template.available}
          >
            <Copy className="h-3 w-3 mr-1" />
            Duplicate
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownload}
              disabled={!template.available || isDownloading || (hasMultipleFormats && !selectedFormat)}
              loading={isDownloading}
            >
              <Download className="h-3 w-3 mr-1" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            <Button 
              size="sm"
              onClick={() => onPreview(template)}
              disabled={!template.available}
            >
              Use Template
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
