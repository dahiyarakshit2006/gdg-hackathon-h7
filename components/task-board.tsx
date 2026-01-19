"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Clock, User, MoreVertical, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Task {
  id: string
  title: string
  description?: string
  assignee: {
    name: string
    initials: string
    color: string
  }
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate?: Date
}

interface TaskBoardProps {
  tasks: Task[]
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void
  onAddTask?: () => void
}

const statusConfig = {
  todo: {
    label: "To Do",
    icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
  },
  "in-progress": {
    label: "In Progress",
    icon: Clock,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
}

const priorityConfig = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-warning/20 text-warning" },
  high: { label: "High", className: "bg-destructive/20 text-destructive" },
}

export function TaskBoard({ tasks, onStatusChange, onAddTask }: TaskBoardProps) {
  const [localTasks, setLocalTasks] = useState(tasks)

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    setLocalTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )
    onStatusChange?.(taskId, newStatus)
  }

  const groupedTasks = {
    todo: localTasks.filter((t) => t.status === "todo"),
    "in-progress": localTasks.filter((t) => t.status === "in-progress"),
    completed: localTasks.filter((t) => t.status === "completed"),
  }

  const totalTasks = localTasks.length
  const completedTasks = groupedTasks.completed.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Task Management
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
          <Button size="sm" onClick={onAddTask} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(statusConfig) as Task["status"][]).map((status) => {
            const config = statusConfig[status]
            const StatusIcon = config.icon

            return (
              <div key={status} className="space-y-3">
                <div className={`flex items-center gap-2 p-2 rounded-lg ${config.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${config.color}`} />
                  <span className="text-sm font-medium">{config.label}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {groupedTasks[status].length}
                  </Badge>
                </div>

                <div className="space-y-2 min-h-[200px]">
                  {groupedTasks[status].map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight truncate">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                              <MoreVertical className="h-3 w-3" />
                              <span className="sr-only">Task options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {status !== "todo" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(task.id, "todo")}
                              >
                                Move to To Do
                              </DropdownMenuItem>
                            )}
                            {status !== "in-progress" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(task.id, "in-progress")}
                              >
                                Move to In Progress
                              </DropdownMenuItem>
                            )}
                            {status !== "completed" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(task.id, "completed")}
                              >
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback
                              className="text-xs"
                              style={{ backgroundColor: task.assignee.color }}
                            >
                              {task.assignee.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                            {task.assignee.name}
                          </span>
                        </div>
                        <Badge className={`text-xs ${priorityConfig[task.priority].className}`}>
                          {priorityConfig[task.priority].label}
                        </Badge>
                      </div>

                      {task.dueDate && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            Due{" "}
                            {task.dueDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {groupedTasks[status].length === 0 && (
                    <div className="h-[100px] flex items-center justify-center border border-dashed border-border rounded-lg">
                      <p className="text-xs text-muted-foreground">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
