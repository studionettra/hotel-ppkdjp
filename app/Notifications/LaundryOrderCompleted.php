<?php

namespace App\Notifications;

use App\Models\LaundryItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LaundryOrderCompleted extends Notification
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
            'type' => 'laundry_order_completed',
            'laundry_id' => $this->laundry->id,
            'message' => 'Pesanan Laundry untuk kamar ' . ($this->laundry->room->room_number ?? 'Unknown') . ' telah SELESAI/DIKIRIM.',
            'url' => route('dashboard'), // FO usually checks dashboard
        ];
    }
}
