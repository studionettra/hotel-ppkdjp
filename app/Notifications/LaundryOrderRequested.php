<?php

namespace App\Notifications;

use App\Models\LaundryItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LaundryOrderRequested extends Notification
{
    use Queueable;

    public $laundry;

    /**
     * Create a new notification instance.
     */
    public function __construct(LaundryItem $laundry)
    {
        $this->laundry = $laundry;
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
            'type' => 'laundry_order',
            'laundry_id' => $this->laundry->id,
            'message' => 'Pesanan Laundry baru dari FO untuk kamar ' . ($this->laundry->room->room_number ?? 'Unknown'),
            'url' => route('laundry.index'),
        ];
    }
}
