
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart2, FileText } from 'lucide-react';
import { Participant, Group, IndividualScore, GroupScore } from '@/types';
import { ChartContainer } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StatisticsTabProps {
  participants: Participant[];
  groups: Group[];
  individualScores: IndividualScore[];
  groupScores: GroupScore[];
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({ 
  participants, 
  groups, 
  individualScores, 
  groupScores 
}) => {
  // Calculate participant counts by category
  const kidCount = participants.filter(p => p.category === 'kids').length;
  const juniorCount = participants.filter(p => p.category === 'juniors').length;
  const activeCount = participants.filter(p => p.category === 'active').length;
  
  // Create data for the bar chart - one entry per category
  const chartData = [
    { name: 'Kinder', value: kidCount, color: '#3b82f6' }, // blue-500
    { name: 'Junioren', value: juniorCount, color: '#22c55e' }, // green-500
    { name: 'Aktive', value: activeCount, color: '#ef4444' }, // red-500
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" />
          Turnierstatistiken
        </CardTitle>
        <CardDescription>
          Übersicht über das aktuelle Turnier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Teilnehmer</h3>
            <p className="text-3xl font-bold">{participants.length}</p>
            <p className="text-sm text-muted-foreground">Gesamt</p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Gruppen</h3>
            <p className="text-3xl font-bold">{groups.length}</p>
            <p className="text-sm text-muted-foreground">Gesamt</p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Bewertungen</h3>
            <p className="text-3xl font-bold">{individualScores.length + groupScores.length}</p>
            <p className="text-sm text-muted-foreground">Gesamt</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="font-medium mb-4">Teilnehmer pro Kategorie</h3>
          <div className="h-[300px] w-full bg-muted rounded-md p-4 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                barCategoryGap="20%"
                barGap={0}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280' }}
                  tickLine={{ stroke: '#d1d5db' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280' }}
                  tickLine={{ stroke: '#d1d5db' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value} Teilnehmer`, '']}
                  labelStyle={{ color: '#111827' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={80}
                  fillOpacity={0.9}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Statistikbericht generieren
        </Button>
      </CardFooter>
    </Card>
  );
};
