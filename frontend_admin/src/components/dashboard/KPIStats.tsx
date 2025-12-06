import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { KPIS } from '../../utils/mockData';

export function KPIStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {KPIS.map((kpi, index) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/20 transition-all group">
            <CardContent className="p-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.label}</p>
                <h3 className="text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {kpi.value}
                </h3>
                <div className="flex items-center mt-2 gap-2">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    kpi.trend === 'up' 
                      ? 'bg-green-500/10 text-green-500' 
                      : kpi.trend === 'down' 
                        ? 'bg-red-500/10 text-red-500' 
                        : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {kpi.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                <kpi.icon className="w-5 h-5 text-primary" />
              </div>
            </CardContent>
            {/* Sparkline decoration */}
            <div className="h-1 w-full bg-secondary mt-2 overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/20" />
              <motion.div 
                className="h-full bg-primary" 
                initial={{ width: "0%" }}
                animate={{ width: `${Math.random() * 40 + 60}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
