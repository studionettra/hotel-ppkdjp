<?php

namespace App\Notifications;

use App\Models\HousekeepingTask;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class HousekeepingTaskCompleted extends Notification
{
    use Queueable;

    public $task;

    /**
     * Create a new notification instance.
     */
    public function __construct(HousekeepingTask $task)
    {
        $this->task = $task;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'housekeeping_task_completed',
            'task_id' => $this->task->id,
            'room_id' => $this->task->room_id,
            'message' => 'Tugas HK (' . ucfirst($this->task->task_type) . ') untuk kamar ' . ($this->task->room->room_number ?? 'Unknown') . ' telah SELESAI.',
            'url' => route('dashboard'), // FO usually checks dashboard
        ];
    }
}
