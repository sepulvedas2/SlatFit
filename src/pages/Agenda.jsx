import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, Check, 
  Trash2, Clock, Trophy, BarChart3, Sparkles
} from "lucide-react";
import { format, addDays, subDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function Agenda() {
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTask, setNewTask] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [showWeekView, setShowWeekView] = useState(false);
  const [celebrateTask, setCelebrateTask] = useState(null);

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
      setNewTask("");
      setNewTaskTime("");
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      const task = tasks.find(t => t.id === taskId);
      return base44.entities.AgendaTask.update(taskId, {
        is_completed: true,
        completed_at: new Date().toISOString()
      });
    },
    onSuccess: (_, taskId) => {
      setCelebrateTask(taskId);
      setTimeout(() => setCelebrateTask(null), 3000);
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

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    
    addTaskMutation.mutate({
      description: newTask.trim(),
      time: newTaskTime || "00:00"
    });
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Date Navigation */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {format(selectedDate, "EEEE", { locale: ptBR })}
              </h1>
              <p className="text-[#CEEDB2]">
                {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                className="border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(new Date())}
                className="border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
              >
                <Calendar className="w-5 h-5 text-[#CEF17B]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>

          {/* Week Timeline */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const dayTasks = weekTasks.filter(t => 
                isSameDay(parseISO(t.task_date), day)
              );
              const hasCompleted = dayTasks.some(t => t.is_completed);
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`p-3 rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-[#CEF17B] text-[#084734]' 
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <p className="text-xs mb-1">
                    {format(day, 'EEE', { locale: ptBR })}
                  </p>
                  <p className="text-lg font-bold">
                    {format(day, 'd')}
                  </p>
                  {hasCompleted && (
                    <Check className="w-3 h-3 mx-auto mt-1 text-green-400" />
                  )}
                  {isToday && !isSelected && (
                    <div className="w-1 h-1 rounded-full bg-[#CEF17B] mx-auto mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Progress Card */}
        {totalToday > 0 && (
          <Card className="glass-effect p-4 border-[#CEF17B]/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold">Progresso de Hoje</p>
              <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                {completedToday}/{totalToday} tarefas
              </Badge>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-[#CEF17B] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </Card>
        )}

        {/* Add Task Card */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#CEF17B]" />
            <h3 className="font-bold text-white">Digite aqui sua programação do dia 🕒</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="time"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                className="w-32 bg-white/5 border-white/10 text-white"
              />
              <Input
                placeholder="Ex: Ir para a academia, Reunião importante..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/50"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleAddTask}
                disabled={!newTask.trim() || addTaskMutation.isPending}
                className="flex-1 gradient-button text-[#084734]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Tarefa
              </Button>
              <Button
                onClick={() => {
                  setNewTask("");
                  setNewTaskTime("");
                }}
                variant="outline"
                className="border-white/10 hover:bg-white/5"
              >
                Limpar
              </Button>
            </div>
          </div>
        </Card>

        {/* Tasks List */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <h3 className="font-bold text-white mb-4">Tarefas do Dia</h3>
          
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">Nenhuma tarefa programada para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {sortedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                      task.is_completed 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {task.task_time && task.task_time !== "00:00" && (
                        <div className="flex items-center gap-1 text-[#CEEDB2] text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{task.task_time}</span>
                        </div>
                      )}
                      <p className={`flex-1 ${task.is_completed ? 'line-through text-white/60' : 'text-white'}`}>
                        {task.task_description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.is_completed ? (
                        <Badge className="bg-green-500/20 text-green-400 border-0">
                          <Trophy className="w-3 h-3 mr-1" />
                          Concluída
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => completeTaskMutation.mutate(task.id)}
                          size="sm"
                          className="bg-[#CEF17B] hover:bg-[#CEF17B]/90 text-[#084734]"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => deleteTaskMutation.mutate(task.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Celebration Animation */}
                    {celebrateTask === task.id && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="absolute inset-0 flex items-center justify-center bg-[#CEF17B]/20 rounded-lg"
                      >
                        <div className="text-4xl">🏆</div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>

        {/* Week View Button */}
        <Button
          onClick={() => setShowWeekView(!showWeekView)}
          variant="outline"
          className="w-full border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          {showWeekView ? 'Ocultar Semana' : '📅 Ver Semana'}
        </Button>

        {/* Week Stats */}
        {showWeekView && (
          <Card className="glass-effect p-6 border-[#CEF17B]/20">
            <h3 className="font-bold text-white mb-4">Resumo Semanal</h3>
            <div className="space-y-3">
              {getWeekStats().map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm">
                      {format(stat.date, 'EEEE, dd/MM', { locale: ptBR })}
                    </p>
                    <Badge className="bg-white/10 text-white border-0 text-xs">
                      {stat.completed}/{stat.total}
                    </Badge>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-[#CEF17B] h-2 rounded-full transition-all"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}