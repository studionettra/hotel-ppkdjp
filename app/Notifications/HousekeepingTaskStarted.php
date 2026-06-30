<?php

namespace App\Notifications;

use App\Models\HousekeepingTask;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class HousekeepingTaskStarted extends Notification
{
    use Queueable;

    public $task;

    public function __construct(HousekeepingTask $task)
    {
        $this->task = $task;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $taskTypeLabels = [
            'cleaning' => 'Pembersihan',
            'inspection' => 'Inspeksi',
            'maintenance' => 'Pemeliharaan',
            'deep_clean' => 'Deep Clean',
            'extrabed' => 'Ekstrabed'
        ];
        $typeLabel = $taskTypeLabels[$this->task->task_type] ?? ucfirst($this->task->task_type);

        return [
            'type' => 'housekeeping_task_started',
            'task_id' => $this->task->id,
            'room_id' => $this->task->room_id,
            'message' => 'Tugas HK (' . $typeLabel . ') untuk kamar ' . ($this->task->room->room_number ?? 'Unknown') . ' sedang MULAI DIKERJAKAN.',
            'url' => route('housekeeping.tasks.index'),
        ];
    }
}
