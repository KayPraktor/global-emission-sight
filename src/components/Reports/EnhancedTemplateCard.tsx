import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download, Star, Eye, Calendar, TrendingUp, FileText, ExternalLink } from 'lucide-react';
import { downloadTemplate, duplicateTemplate, Template } from '@/services/templateService';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { cn } from '@/lib/utils';

interface EnhancedTemplateCardProps {
  template: Template;
  onPreview: (template: Template) => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  viewMode: 'grid' | 'list';
}

const EnhancedTemplateCard: React.FC<EnhancedTemplateCardProps> = ({ 
  template, 
  onPreview, 
  isFavorited, 
  onToggleFavorite,
  viewMode 
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  const formats = template.format.split(',').map(f => f.trim());
  const hasMultipleFormats = formats.length > 1;

  const handleDownload = async () => {
    if (hasMultipleFormats && !selectedFormat) {
      return;
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

  const getPopularityIcon = () => {
    switch (template.popularity) {
      case 'High':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'Medium':
        return <TrendingUp className="h-3 w-3 text-yellow-500" />;
      case 'Low':
        return <TrendingUp className="h-3 w-3 text-gray-400" />;
      default:
        return null;
    }
  };

  const getPopularityColor = () => {
    switch (template.popularity) {
      case 'High':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Low':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (viewMode === 'list') {
    return (
      <GlassmorphismCard className={cn(
        'p-4 transition-all duration-200 hover:scale-[1.02]',
        !template.available && 'opacity-60'
      )}>
        <div className="flex items-center gap-4">
          {/* Preview Image */}
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-sm truncate">{template.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    {getPopularityIcon()}
                    <span className="text-xs font-medium">{template.popularity}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {template.lastUpdated}
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFavorite}
                  className="p-2"
                >
                  <Star className={cn("h-4 w-4", isFavorited && "fill-yellow-400 text-yellow-400")} />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPreview(template)}
                  disabled={!template.available}
                  className="px-3"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleDownload}
                  disabled={!template.available || isDownloading || (hasMultipleFormats && !selectedFormat)}
                  className="px-3"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </GlassmorphismCard>
    );
  }

  return (
    <GlassmorphismCard className={cn(
      'overflow-hidden transition-all duration-200 hover:scale-[1.02] group',
      !template.available && 'opacity-60'
    )}>
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{template.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFavorite}
            className="ml-2 p-1 flex-shrink-0"
          >
            <Star className={cn("h-4 w-4", isFavorited && "fill-yellow-400 text-yellow-400")} />
          </Button>
        </div>
        
        <div className="flex gap-1 mt-3">
          <Badge variant="outline" className="text-xs">
            {template.categories[0].toUpperCase()}
          </Badge>
          <Badge className={cn("text-xs", getPopularityColor())}>
            {getPopularityIcon()}
            <span className="ml-1">{template.popularity}</span>
          </Badge>
          {!template.available && (
            <Badge variant="destructive" className="text-xs">
              Unavailable
            </Badge>
          )}
        </div>
      </div>
      
      {/* Preview Area */}
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative group/preview">
          <div className="text-center p-4">
            <FileText className="h-12 w-12 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-primary">{template.title}</p>
            <p className="text-xs text-muted-foreground mt-1">Click to preview</p>
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onPreview(template)}
                disabled={!template.available}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => window.open('#', '_blank')}
                disabled={!template.available}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div>
            <p className="text-muted-foreground">Format</p>
            <p className="font-medium">{template.format}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Updated
            </p>
            <p className="font-medium">{template.lastUpdated}</p>
          </div>
        </div>
        
        {hasMultipleFormats && (
          <div className="mb-3">
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {formats.map((format) => (
                  <SelectItem key={format} value={format} className="text-xs">
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 pt-0 border-t border-border/50">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDuplicate}
            disabled={!template.available}
            className="text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            Duplicate
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onPreview(template)}
              disabled={!template.available}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button 
              size="sm"
              onClick={handleDownload}
              disabled={!template.available || isDownloading || (hasMultipleFormats && !selectedFormat)}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              {isDownloading ? 'Loading...' : 'Use'}
            </Button>
          </div>
        </div>
      </div>
    </GlassmorphismCard>
  );
};

export default EnhancedTemplateCard;