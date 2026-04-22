import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, Star } from 'lucide-react';

interface EditorCardProps {
  editor: {
    id: string;
    name: string;
    avatar?: string;
    skills: string[];
    experience: string;
    bio?: string;
  };
  onHire?: () => void;
}

const EditorCard: React.FC<EditorCardProps> = ({ editor, onHire }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={editor.avatar} alt={editor.name} />
            <AvatarFallback className="bg-rose-100 text-rose-600 text-xl">
              {editor.name ? editor.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{editor.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Briefcase className="h-4 w-4 mr-1 text-rose-500" />
              <span>{editor.experience}</span>
            </div>
          </div>
        </div>
        
        {editor.bio && (
          <p className="text-sm text-gray-600 mt-4 line-clamp-2">{editor.bio}</p>
        )}
        
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {editor.skills.slice(0, 4).map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {skill}
              </Badge>
            ))}
            {editor.skills.length > 4 && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                +{editor.skills.length - 4}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button onClick={onHire} className="w-full bg-rose-500 hover:bg-rose-600">
          <Star className="h-4 w-4 mr-2" />
          Hire Editor
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EditorCard;
