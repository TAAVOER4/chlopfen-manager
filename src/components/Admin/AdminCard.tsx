
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminCardProps {
  title: string;
  description: string;
  content: string;
  icon: ReactNode;
  linkTo: string;
  linkText?: string;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  title,
  description,
  content,
  icon,
  linkTo,
  linkText = 'Verwalten'
}) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          {content}
        </p>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button asChild className="w-full">
          <Link to={linkTo}>
            {linkText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
