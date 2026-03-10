import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Check, Trash2, Clock, Calendar
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import AddTaskModal from "../components/agenda/AddTaskModal";

export default function Agenda() {
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState("day"); // "day" or "week"

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: tasks = [] } = useQuery({
    queryKey: ['agendaTasks', user?.email, formattedDate],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.AgendaTask.filter({
        user_email: user.email,
        task_date: formattedDate
      });
    },
    enabled: !!user?.email,
  });

  const { data: weekTasks = [] } = useQuery({
    queryKey: ['weekAgendaTasks', user?.email, format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!user?.email) return [];
      const allTasks = await base44.entities.AgendaTask.filter({
        user_email: user.email
      });
      // Filter tasks for the current week
      return allTasks.filter(task => {
        const taskDate = parseISO(task.task_date);
        return taskDate >= weekStart && taskDate < addDays(weekStart, 7);
      });
    },
    enabled: !!user?.email,
  });

  const addTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      return base44.entities.AgendaTask.create({
        user_email: user.email,
        task_date: formattedDate,
        task_time: taskData.time || "00:00",
        task_description: taskData.description,
        category: "personal"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agendaTasks']);
      queryClient.invalidateQueries(['weekAgendaTasks']);
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      return base44.entities.AgendaTask.update(taskId, {
        is_completed: true,
        completed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agendaTasks']);
      queryClient.invalidateQueries(['weekAgendaTasks']);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      return base44.entities.AgendaTask.delete(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['agendaTasks']);
      queryClient.invalidateQueries(['weekAgendaTasks']);
    },
  });

  const handleAddTask = (taskData) => {
    addTaskMutation.mutate(taskData);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1;
    }
    return a.task_time.localeCompare(b.task_time);
  });

  const completedToday = tasks.filter(t => t.is_completed).length;
  const totalToday = tasks.length;
  const progressPercentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  const getWeekStats = () => {
    const stats = weekDays.map(day => {
      const dayTasks = weekTasks.filter(t => 
        isSameDay(parseISO(t.task_date), day)
      );
      const completed = dayTasks.filter(t => t.is_completed).length;
      const total = dayTasks.length;
      return {
        date: day,
        completed,
        total,
        percentage: total > 0 ? (completed / total) * 100 : 0
      };
    });
    return stats;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-4">
        
        {/* Header - Compact Date Display */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1 capitalize">
            {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h1>
        </div>

        {/* Week Days Selector - Compact Horizontal */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {weekDays.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const dayTasks = weekTasks.filter(t => isSameDay(parseISO(t.task_date), day));
            const hasCompleted = dayTasks.some(t => t.is_completed);
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all border-2 ${
                  isSelected 
                    ? 'bg-[#CEF17B] text-[#084734] border-[#CEF17B]' 
                    : 'bg-white/5 text-white border-white/10 hover:border-[#CEF17B]/30'
                }`}
              >
                <p className="text-xs font-medium">
                  {format(day, 'EEE', { locale: ptBR })}
                </p>
                <p className="text-xl font-bold">
                  {format(day, 'd')}
                </p>
                {hasCompleted && !isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                )}
                {isToday && !isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#CEF17B]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Add Task Card */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full p-4 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 hover:border-[#CEF17B]/50 hover:bg-white/10 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#CEF17B]" />
            </div>
            <p className="text-white/60">📝 Adicionar tarefa...</p>
          </div>
        </button>

        {/* Tasks List - Clean & Minimal */}
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">Nenhuma tarefa para hoje.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {sortedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                    task.is_completed 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <button
                    onClick={() => completeTaskMutation.mutate(task.id)}
                    disabled={task.is_completed}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.is_completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-white/30 hover:border-[#CEF17B]'
                    }`}
                  >
                    {task.is_completed && <Check className="w-4 h-4 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`${task.is_completed ? 'line-through text-white/40' : 'text-white'}`}>
                      {task.task_description}
                    </p>
                    {task.task_time && task.task_time !== "00:00" && (
                      <div className="flex items-center gap-1 text-[#CEEDB2]/60 text-xs mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.task_time}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => deleteTaskMutation.mutate(task.id)}
                    size="icon"
                    variant="ghost"
                    className="flex-shrink-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setViewMode("day")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              viewMode === "day"
                ? 'bg-[#CEF17B] text-[#084734]'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              viewMode === "week"
                ? 'bg-[#CEF17B] text-[#084734]'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Semana
          </button>
        </div>

        {/* Week View */}
        {viewMode === "week" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 pt-4"
          >
            {getWeekStats().map((stat, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-sm font-medium capitalize">
                    {format(stat.date, 'EEEE, dd/MM', { locale: ptBR })}
                  </p>
                  <Badge className="bg-white/10 text-white border-0 text-xs">
                    {stat.completed}/{stat.total}
                  </Badge>
                </div>
                {stat.total > 0 && (
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className="bg-[#CEF17B] h-1.5 rounded-full transition-all"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* FAB Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full gradient-button text-[#084734] shadow-lg hover:scale-110 transition-transform z-50"
        >
          <Plus className="w-6 h-6 mx-auto" />
        </button>

        {/* Add Task Modal */}
        <AddTaskModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTask}
        />

      </div>
    </div>
  );
}